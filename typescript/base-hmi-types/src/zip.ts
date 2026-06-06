export type ZipByteArrayLike = Uint8Array | ArrayBufferLike | ArrayBufferView;

export interface ZipFileBlob {
  readonly size?: number;
  slice?(start?: number, end?: number): { arrayBuffer(): Promise<ArrayBuffer> };
}

export interface ZipEntryInfo {
  readonly name: string;
  readonly method: number;
  readonly compressedSize: number;
  readonly uncompressedSize: number;
  readonly localHeaderOffset: number;
}

export interface ZipArchiveOpenOptions {
  readPrefix?: string | ((entries: readonly ZipEntryInfo[]) => string | undefined);
}

const localFileHeaderSignature = 0x04034b50;
const centralDirectorySignature = 0x02014b50;
const endOfCentralDirectorySignature = 0x06054b50;
const zip64Value16 = 0xffff;
const zip64Value32 = 0xffffffff;

export class ZipArchive {
  private readonly entries = new Map<string, ZipEntryInfo>();
  private readonly readPrefix: string;

  private constructor(
    private readonly readRange: (offset: number, length: number) => Promise<Uint8Array>,
    entries: readonly ZipEntryInfo[],
    options?: ZipArchiveOpenOptions,
  ) {
    for (const entry of entries)
      this.entries.set(normalizeZipPath(entry.name).toLowerCase(), entry);

    const prefix = typeof options?.readPrefix === "function"
      ? options.readPrefix(entries)
      : options?.readPrefix;
    this.readPrefix = normalizeZipPath(prefix ?? "").replace(/\/?$/, prefix ? "/" : "");
  }

  static isZip(bytes: ZipByteArrayLike): boolean {
    return isZipHeader(toZipBytes(bytes));
  }

  static open(bytes: ZipByteArrayLike, options?: ZipArchiveOpenOptions): ZipArchive {
    const data = toZipBytes(bytes);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const eocd = findEndOfCentralDirectory(view);
    const entries = readCentralDirectoryEntries(data, eocd);
    return new ZipArchive((offset, length) => Promise.resolve(data.subarray(offset, offset + length)), entries, options);
  }

  static async openFile(file: ZipFileBlob, options?: ZipArchiveOpenOptions): Promise<ZipArchive> {
    if (!ZipArchive.canOpenFile(file))
      throw new Error("Lazy ZIP reading requires a browser File/Blob with size and slice().");

    const size = file.size;
    const tailLength = Math.min(size, 0xffff + 22);
    const tail = await readFileRange(file, size - tailLength, tailLength);
    const tailView = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
    const relativeEocd = findEndOfCentralDirectory(tailView);
    const entryCount = tailView.getUint16(relativeEocd + 10, true);
    const centralDirectorySize = tailView.getUint32(relativeEocd + 12, true);
    const centralDirectoryOffset = tailView.getUint32(relativeEocd + 16, true);
    if (entryCount === zip64Value16 || centralDirectorySize === zip64Value32 || centralDirectoryOffset === zip64Value32)
      throw new Error("ZIP64 archives are not supported.");

    const centralDirectory = await readFileRange(file, centralDirectoryOffset, centralDirectorySize);
    const entries = readCentralDirectoryEntries(centralDirectory, 0, entryCount);
    return new ZipArchive((offset, length) => readFileRange(file, offset, length), entries, options);
  }

  static canOpenFile(file: ZipFileBlob): file is ZipFileBlob & Required<Pick<ZipFileBlob, "size" | "slice">> {
    return typeof file.size === "number" && typeof file.slice === "function";
  }

  static async isZipFile(file: ZipFileBlob): Promise<boolean> {
    if (!ZipArchive.canOpenFile(file))
      return false;

    return isZipHeader(await readFileRange(file, 0, Math.min(file.size, 4)));
  }

  async readFile(path: string): Promise<Uint8Array | undefined> {
    const prefixedPath = this.readPrefix ? `${this.readPrefix}${normalizeZipPath(path)}` : path;
    const normalized = normalizeZipPath(prefixedPath).toLowerCase();
    const entry = this.entries.get(normalized) ?? this.findEntryBySuffix(path);
    if (!entry || entry.name.endsWith("/") || entry.name.endsWith("\\"))
      return undefined;

    return this.readEntry(entry);
  }

  listFiles(): string[] {
    return [...this.entries.values()].map(entry => normalizeZipPath(entry.name));
  }

  entriesInfo(): ZipEntryInfo[] {
    return [...this.entries.values()];
  }

  private findEntryBySuffix(path: string): ZipEntryInfo | undefined {
    const suffix = `/${normalizeZipPath(path).toLowerCase()}`;
    return [...this.entries.entries()].find(([name]) => name.endsWith(suffix) || name === suffix.slice(1))?.[1];
  }

  private async readEntry(entry: ZipEntryInfo): Promise<Uint8Array> {
    const header = await this.readRange(entry.localHeaderOffset, 30);
    const view = new DataView(header.buffer, header.byteOffset, header.byteLength);
    if (view.getUint32(0, true) !== localFileHeaderSignature)
      throw new Error(`Invalid ZIP local file header at ${entry.localHeaderOffset}.`);

    const nameLength = view.getUint16(26, true);
    const extraLength = view.getUint16(28, true);
    const dataStart = entry.localHeaderOffset + 30 + nameLength + extraLength;
    const compressed = await this.readRange(dataStart, entry.compressedSize);

    if (entry.method === 0)
      return compressed.slice();
    if (entry.method !== 8)
      throw new Error(`Unsupported ZIP compression method ${entry.method} for ${entry.name}.`);

    const decompressed = await inflateRaw(compressed);
    if (entry.uncompressedSize !== zip64Value32 && decompressed.length !== entry.uncompressedSize)
      throw new Error(`Invalid ZIP entry size for ${entry.name}: expected ${entry.uncompressedSize}, got ${decompressed.length}.`);
    return decompressed;
  }
}

export function toZipBytes(value: ZipByteArrayLike): Uint8Array {
  if (value instanceof Uint8Array)
    return value;
  if (ArrayBuffer.isView(value))
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  return new Uint8Array(value);
}

export function normalizeZipPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

function isZipHeader(bytes: Uint8Array): boolean {
  return bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
    (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08);
}

function readCentralDirectoryEntries(
  bytes: Uint8Array,
  eocd: number,
  expectedEntryCount?: number,
): ZipEntryInfo[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const entryCount = expectedEntryCount ?? view.getUint16(eocd + 10, true);
  const centralDirectorySize = expectedEntryCount == null ? view.getUint32(eocd + 12, true) : bytes.byteLength;
  const centralDirectoryOffset = expectedEntryCount == null ? view.getUint32(eocd + 16, true) : 0;
  if (entryCount === zip64Value16 || centralDirectorySize === zip64Value32 || centralDirectoryOffset === zip64Value32)
    throw new Error("ZIP64 archives are not supported.");

  const entries: ZipEntryInfo[] = [];
  let position = centralDirectoryOffset;
  const endPosition = centralDirectoryOffset + centralDirectorySize;

  for (let i = 0; i < entryCount; i++) {
    if (position + 46 > view.byteLength || position >= endPosition)
      throw new Error(`Invalid ZIP central directory entry at ${position}.`);
    if (view.getUint32(position, true) !== centralDirectorySignature)
      throw new Error(`Invalid ZIP central directory entry at ${position}.`);

    const method = view.getUint16(position + 10, true);
    const compressedSize = view.getUint32(position + 20, true);
    const uncompressedSize = view.getUint32(position + 24, true);
    const nameLength = view.getUint16(position + 28, true);
    const extraLength = view.getUint16(position + 30, true);
    const commentLength = view.getUint16(position + 32, true);
    const localHeaderOffset = view.getUint32(position + 42, true);
    const nameOffset = position + 46;
    const nextPosition = nameOffset + nameLength + extraLength + commentLength;
    if (nextPosition > view.byteLength)
      throw new Error(`Invalid ZIP central directory entry at ${position}.`);

    const name = new TextDecoder().decode(bytes.subarray(nameOffset, nameOffset + nameLength));
    entries.push({ name, method, compressedSize, uncompressedSize, localHeaderOffset });
    position = nextPosition;
  }

  return entries;
}

function findEndOfCentralDirectory(view: DataView): number {
  const min = Math.max(0, view.byteLength - 0xffff - 22);
  for (let position = view.byteLength - 22; position >= min; position--) {
    if (view.getUint32(position, true) === endOfCentralDirectorySignature)
      return position;
  }
  throw new Error("ZIP end of central directory was not found.");
}

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  const decompressionStreamCtor = (globalThis as typeof globalThis & {
    DecompressionStream?: new(format: string) => { writable: WritableStream<Uint8Array>; readable: ReadableStream<Uint8Array> };
  }).DecompressionStream;
  if (!decompressionStreamCtor)
    throw new Error("ZIP deflate support requires DecompressionStream.");

  const input = bytes.slice().buffer as ArrayBuffer;
  const stream = new Blob([input]).stream().pipeThrough(new decompressionStreamCtor("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readFileRange(
  file: ZipFileBlob & Required<Pick<ZipFileBlob, "slice">>,
  offset: number,
  length: number,
): Promise<Uint8Array> {
  if (length <= 0)
    return new Uint8Array();

  const blob = file.slice(offset, offset + length);
  return new Uint8Array(await blob.arrayBuffer());
}
