interface TiffReader {
  readonly littleEndian: boolean;
  readUint16(bytes: Uint8Array, offset: number): number;
  readInt16(bytes: Uint8Array, offset: number): number;
  readUint32(bytes: Uint8Array, offset: number): number;
  readInt32(bytes: Uint8Array, offset: number): number;
}

interface TiffImage {
  width: number;
  height: number;
  bitsPerSample: number[];
  compression: number;
  photometric: number;
  stripOffsets: number[];
  stripByteCounts: number[];
  samplesPerPixel: number;
  rowsPerStrip: number;
  planarConfiguration: number;
  colorMap?: number[];
  extraSamples: number[];
  orientation: number;
  predictor: number;
}

const enum TiffTag {
  ImageWidth = 256,
  ImageLength = 257,
  BitsPerSample = 258,
  Compression = 259,
  PhotometricInterpretation = 262,
  StripOffsets = 273,
  Orientation = 274,
  SamplesPerPixel = 277,
  RowsPerStrip = 278,
  StripByteCounts = 279,
  PlanarConfiguration = 284,
  Predictor = 317,
  ColorMap = 320,
  ExtraSamples = 338,
}

const enum TiffType {
  Byte = 1,
  Ascii = 2,
  Short = 3,
  Long = 4,
  SByte = 6,
  Undefined = 7,
  SShort = 8,
  SLong = 9,
}

export class TiffToPngRenderer {
  async render(bytes: Uint8Array, extension?: string | null): Promise<string | null> {
    if (!isTiff(bytes, extension))
      return null;

    try {
      const decoded = decodeTiff(bytes);
      return decoded ? await rgbaToPngDataUri(decoded.rgba, decoded.width, decoded.height) : null;
    } catch {
      return null;
    }
  }
}

function decodeTiff(bytes: Uint8Array): { rgba: Uint8Array; width: number; height: number } | null {
  const reader = createReader(bytes);
  if (!reader)
    return null;

  const firstIfdOffset = reader.readUint32(bytes, 4);
  const image = firstDisplayableImage(bytes, reader, firstIfdOffset);
  if (!image || !canRender(image))
    return null;

  const raster = decodeStrips(bytes, image);
  if (!raster)
    return null;

  const rgba = image.planarConfiguration === 2
    ? planarRasterToRgba(raster, image, reader)
    : chunkyRasterToRgba(raster, image, reader);
  return rgba ? orientRgba(rgba, image.width, image.height, image.orientation) : null;
}

function firstDisplayableImage(bytes: Uint8Array, reader: TiffReader, firstIfdOffset: number): TiffImage | null {
  let ifdOffset = firstIfdOffset;
  const visited = new Set<number>();
  while (ifdOffset > 0 && ifdOffset + 2 <= bytes.length && !visited.has(ifdOffset)) {
    visited.add(ifdOffset);
    const parsed = parseImageFileDirectory(bytes, reader, ifdOffset);
    if (!parsed)
      return null;
    if (validDimension(parsed.image.width) && validDimension(parsed.image.height))
      return parsed.image;
    ifdOffset = parsed.nextIfdOffset;
  }
  return null;
}

function parseImageFileDirectory(bytes: Uint8Array, reader: TiffReader, offset: number): { image: TiffImage; nextIfdOffset: number } | null {
  const entryCount = reader.readUint16(bytes, offset);
  if (offset + 2 + entryCount * 12 + 4 > bytes.length)
    return null;

  const tags = new Map<number, number[]>();
  for (let index = 0; index < entryCount; index++) {
    const entryOffset = offset + 2 + index * 12;
    const tag = reader.readUint16(bytes, entryOffset);
    const values = readTagValues(bytes, reader, entryOffset);
    if (values)
      tags.set(tag, values);
  }

  const nextIfdOffset = reader.readUint32(bytes, offset + 2 + entryCount * 12);
  const samplesPerPixel = first(tags, TiffTag.SamplesPerPixel) ?? 1;
  const image: TiffImage = {
    width: first(tags, TiffTag.ImageWidth) ?? 0,
    height: first(tags, TiffTag.ImageLength) ?? 0,
    bitsPerSample: normalizeBitsPerSample(tags.get(TiffTag.BitsPerSample), samplesPerPixel),
    compression: first(tags, TiffTag.Compression) ?? 1,
    photometric: first(tags, TiffTag.PhotometricInterpretation) ?? 1,
    stripOffsets: tags.get(TiffTag.StripOffsets) ?? [],
    stripByteCounts: tags.get(TiffTag.StripByteCounts) ?? [],
    samplesPerPixel,
    rowsPerStrip: first(tags, TiffTag.RowsPerStrip) ?? Number.MAX_SAFE_INTEGER,
    planarConfiguration: first(tags, TiffTag.PlanarConfiguration) ?? 1,
    colorMap: tags.get(TiffTag.ColorMap),
    extraSamples: tags.get(TiffTag.ExtraSamples) ?? [],
    orientation: first(tags, TiffTag.Orientation) ?? 1,
    predictor: first(tags, TiffTag.Predictor) ?? 1,
  };
  return { image, nextIfdOffset };
}

function canRender(image: TiffImage): boolean {
  return validDimension(image.width)
    && validDimension(image.height)
    && image.width * image.height <= 100_000_000
    && (image.compression === 1 || image.compression === 5 || image.compression === 32773)
    && (image.predictor === 1 || image.predictor === 2)
    && (image.photometric === 0 || image.photometric === 1 || image.photometric === 2 || image.photometric === 3)
    && (image.planarConfiguration === 1 || image.planarConfiguration === 2)
    && image.stripOffsets.length > 0
    && image.stripByteCounts.length > 0
    && image.bitsPerSample.every(bits => bits === 1 || bits === 2 || bits === 4 || bits === 8 || bits === 16)
    && (image.photometric !== 2 || image.samplesPerPixel >= 3)
    && (image.photometric !== 3 || !!image.colorMap);
}

function decodeStrips(bytes: Uint8Array, image: TiffImage): Uint8Array | null {
  const chunks: Uint8Array[] = [];
  let totalLength = 0;
  for (let index = 0; index < image.stripOffsets.length; index++) {
    const offset = image.stripOffsets[index];
    const byteCount = image.stripByteCounts[index] ?? image.stripByteCounts[0];
    if (offset < 0 || byteCount < 0 || offset + byteCount > bytes.length)
      return null;

    const encoded = bytes.slice(offset, offset + byteCount);
    const decoded = decodeStrip(encoded, image.compression);
    if (!decoded)
      return null;
    chunks.push(decoded);
    totalLength += decoded.length;
  }

  const raster = new Uint8Array(totalLength);
  let targetOffset = 0;
  for (const chunk of chunks) {
    raster.set(chunk, targetOffset);
    targetOffset += chunk.length;
  }
  return image.predictor === 2 ? applyHorizontalPredictor(raster, image) : raster;
}

function decodeStrip(bytes: Uint8Array, compression: number): Uint8Array | null {
  switch (compression) {
    case 1: return bytes;
    case 5: return decodeLzw(bytes);
    case 32773: return decodePackBits(bytes);
    default: return null;
  }
}

function chunkyRasterToRgba(raster: Uint8Array, image: TiffImage, reader: TiffReader): Uint8Array | null {
  const rgba = new Uint8Array(image.width * image.height * 4);
  const bitsPerPixel = image.bitsPerSample.slice(0, image.samplesPerPixel).reduce((sum, bits) => sum + bits, 0);
  if (bitsPerPixel <= 0)
    return null;

  for (let pixel = 0; pixel < image.width * image.height; pixel++) {
    const bitOffset = pixel * bitsPerPixel;
    const samples = readChunkySamples(raster, bitOffset, image.bitsPerSample, image.samplesPerPixel, reader);
    if (!samples)
      return null;
    writeRgbaPixel(rgba, pixel * 4, samples, image);
  }
  return rgba;
}

function planarRasterToRgba(raster: Uint8Array, image: TiffImage, reader: TiffReader): Uint8Array | null {
  const rgba = new Uint8Array(image.width * image.height * 4);
  const pixels = image.width * image.height;
  const planeBitLengths = image.bitsPerSample.map(bits => pixels * bits);
  const planeOffsets: number[] = [];
  let nextPlaneOffset = 0;
  for (const bitLength of planeBitLengths) {
    planeOffsets.push(nextPlaneOffset);
    nextPlaneOffset += Math.ceil(bitLength / 8) * 8;
  }

  for (let pixel = 0; pixel < pixels; pixel++) {
    const samples: number[] = [];
    for (let sample = 0; sample < image.samplesPerPixel; sample++) {
      const bits = image.bitsPerSample[sample] ?? image.bitsPerSample[0] ?? 1;
      const value = readSample(raster, planeOffsets[sample] + pixel * bits, bits, reader);
      if (value === null)
        return null;
      samples.push(value);
    }
    writeRgbaPixel(rgba, pixel * 4, samples, image);
  }
  return rgba;
}

function readChunkySamples(raster: Uint8Array, pixelBitOffset: number, bitsPerSample: number[], samplesPerPixel: number, reader: TiffReader): number[] | null {
  const samples: number[] = [];
  let sampleBitOffset = pixelBitOffset;
  for (let sample = 0; sample < samplesPerPixel; sample++) {
    const bits = bitsPerSample[sample] ?? bitsPerSample[0] ?? 1;
    const value = readSample(raster, sampleBitOffset, bits, reader);
    if (value === null)
      return null;
    samples.push(value);
    sampleBitOffset += bits;
  }
  return samples;
}

function writeRgbaPixel(rgba: Uint8Array, offset: number, samples: number[], image: TiffImage): void {
  if (image.photometric === 2) {
    rgba[offset] = scaleSample(samples[0] ?? 0, image.bitsPerSample[0] ?? 8);
    rgba[offset + 1] = scaleSample(samples[1] ?? samples[0] ?? 0, image.bitsPerSample[1] ?? image.bitsPerSample[0] ?? 8);
    rgba[offset + 2] = scaleSample(samples[2] ?? samples[0] ?? 0, image.bitsPerSample[2] ?? image.bitsPerSample[0] ?? 8);
    rgba[offset + 3] = alphaSample(samples, image);
    return;
  }

  if (image.photometric === 3 && image.colorMap) {
    const index = samples[0] ?? 0;
    const colors = image.colorMap.length / 3;
    rgba[offset] = colorMapSample(image.colorMap[index] ?? 0);
    rgba[offset + 1] = colorMapSample(image.colorMap[index + colors] ?? 0);
    rgba[offset + 2] = colorMapSample(image.colorMap[index + colors * 2] ?? 0);
    rgba[offset + 3] = 255;
    return;
  }

  const bits = image.bitsPerSample[0] ?? 8;
  const gray = scaleSample(samples[0] ?? 0, bits);
  const value = image.photometric === 0 ? 255 - gray : gray;
  rgba[offset] = value;
  rgba[offset + 1] = value;
  rgba[offset + 2] = value;
  rgba[offset + 3] = alphaSample(samples, image);
}

function alphaSample(samples: number[], image: TiffImage): number {
  const alphaIndex = image.extraSamples.findIndex(value => value === 1 || value === 2);
  if (alphaIndex < 0)
    return 255;

  const sampleIndex = image.samplesPerPixel - image.extraSamples.length + alphaIndex;
  return scaleSample(samples[sampleIndex] ?? 0, image.bitsPerSample[sampleIndex] ?? image.bitsPerSample[0] ?? 8);
}

function orientRgba(rgba: Uint8Array, width: number, height: number, orientation: number): { rgba: Uint8Array; width: number; height: number } {
  if (orientation < 2 || orientation > 8)
    return { rgba, width, height };

  const rotated = orientation >= 5 && orientation <= 8;
  const targetWidth = rotated ? height : width;
  const targetHeight = rotated ? width : height;
  const output = new Uint8Array(rgba.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [targetX, targetY] = orientedPosition(x, y, width, height, orientation);
      output.set(rgba.slice((y * width + x) * 4, (y * width + x) * 4 + 4), (targetY * targetWidth + targetX) * 4);
    }
  }
  return { rgba: output, width: targetWidth, height: targetHeight };
}

function orientedPosition(x: number, y: number, width: number, height: number, orientation: number): [number, number] {
  switch (orientation) {
    case 2: return [width - 1 - x, y];
    case 3: return [width - 1 - x, height - 1 - y];
    case 4: return [x, height - 1 - y];
    case 5: return [y, x];
    case 6: return [height - 1 - y, x];
    case 7: return [height - 1 - y, width - 1 - x];
    case 8: return [y, width - 1 - x];
    default: return [x, y];
  }
}

function readSample(bytes: Uint8Array, bitOffset: number, bits: number, reader: TiffReader): number | null {
  if (bits === 8 && bitOffset % 8 === 0)
    return bytes[bitOffset / 8] ?? null;
  if (bits === 16 && bitOffset % 8 === 0) {
    const byteOffset = bitOffset / 8;
    return byteOffset + 2 <= bytes.length ? reader.readUint16(bytes, byteOffset) : null;
  }
  if (bitOffset + bits > bytes.length * 8)
    return null;

  let value = 0;
  for (let bit = 0; bit < bits; bit++) {
    const absoluteBit = bitOffset + bit;
    value = (value << 1) | ((bytes[Math.floor(absoluteBit / 8)] >> (7 - (absoluteBit % 8))) & 1);
  }
  return value;
}

function scaleSample(value: number, bits: number): number {
  if (bits === 8)
    return value & 0xff;
  if (bits === 16)
    return value >>> 8;
  return Math.round((value / ((1 << bits) - 1)) * 255);
}

function colorMapSample(value: number): number {
  return value > 255 ? value >>> 8 : value;
}

function decodePackBits(bytes: Uint8Array): Uint8Array {
  const output: number[] = [];
  for (let offset = 0; offset < bytes.length;) {
    const header = bytes[offset++] << 24 >> 24;
    if (header >= 0 && header <= 127) {
      const count = header + 1;
      for (let index = 0; index < count && offset < bytes.length; index++)
        output.push(bytes[offset++]);
    } else if (header >= -127 && header <= -1) {
      const value = bytes[offset++];
      const count = 1 - header;
      for (let index = 0; index < count; index++)
        output.push(value);
    }
  }
  return new Uint8Array(output);
}

function decodeLzw(bytes: Uint8Array): Uint8Array | null {
  const reader = new MsbBitReader(bytes);
  let dictionary = createLzwDictionary();
  let codeSize = 9;
  let nextCode = 258;
  let previous: number[] | null = null;
  const output: number[] = [];

  for (;;) {
    const code = reader.read(codeSize);
    if (code === null)
      break;
    if (code === 256) {
      dictionary = createLzwDictionary();
      codeSize = 9;
      nextCode = 258;
      previous = null;
      continue;
    }
    if (code === 257)
      break;

    let entry = dictionary[code];
    if (!entry && previous && code === nextCode)
      entry = [...previous, previous[0]];
    if (!entry)
      return null;

    output.push(...entry);
    if (previous) {
      dictionary[nextCode++] = [...previous, entry[0]];
      if (nextCode === (1 << codeSize) && codeSize < 12)
        codeSize++;
    }
    previous = entry;
  }

  return new Uint8Array(output);
}

function createLzwDictionary(): number[][] {
  const dictionary: number[][] = [];
  for (let index = 0; index < 256; index++)
    dictionary[index] = [index];
  return dictionary;
}

class MsbBitReader {
  private bitOffset = 0;

  constructor(private readonly bytes: Uint8Array) {
  }

  read(bits: number): number | null {
    if (this.bitOffset + bits > this.bytes.length * 8)
      return null;

    let value = 0;
    for (let index = 0; index < bits; index++) {
      const absoluteBit = this.bitOffset++;
      value = (value << 1) | ((this.bytes[Math.floor(absoluteBit / 8)] >> (7 - (absoluteBit % 8))) & 1);
    }
    return value;
  }
}

function applyHorizontalPredictor(raster: Uint8Array, image: TiffImage): Uint8Array | null {
  if (image.bitsPerSample.some(bits => bits !== 8 && bits !== 16))
    return null;

  const output = new Uint8Array(raster);
  const bytesPerSample = image.bitsPerSample[0] === 16 ? 2 : 1;
  const bytesPerPixel = image.bitsPerSample.slice(0, image.samplesPerPixel).reduce((sum, bits) => sum + bits / 8, 0);
  const rowBytes = image.width * bytesPerPixel;

  if (image.planarConfiguration === 2) {
    const planeRowBytes = image.width * bytesPerSample;
    for (let sample = 0; sample < image.samplesPerPixel; sample++) {
      const planeOffset = sample * image.height * planeRowBytes;
      restorePredictorRows(output, planeOffset, image.height, image.width, bytesPerSample, planeRowBytes);
    }
    return output;
  }

  restorePredictorRows(output, 0, image.height, image.width, bytesPerPixel, rowBytes);
  return output;
}

function restorePredictorRows(bytes: Uint8Array, startOffset: number, rows: number, width: number, stride: number, rowBytes: number): void {
  for (let y = 0; y < rows; y++) {
    const rowOffset = startOffset + y * rowBytes;
    for (let x = 1; x < width; x++) {
      const pixelOffset = rowOffset + x * stride;
      for (let channel = 0; channel < stride; channel++)
        bytes[pixelOffset + channel] = (bytes[pixelOffset + channel] + bytes[pixelOffset + channel - stride]) & 0xff;
    }
  }
}

function readTagValues(bytes: Uint8Array, reader: TiffReader, entryOffset: number): number[] | null {
  const type = reader.readUint16(bytes, entryOffset + 2);
  const count = reader.readUint32(bytes, entryOffset + 4);
  const size = typeSize(type);
  if (!size || count > 1_000_000)
    return null;

  const byteLength = count * size;
  const valueOffset = byteLength <= 4 ? entryOffset + 8 : reader.readUint32(bytes, entryOffset + 8);
  if (valueOffset < 0 || valueOffset + byteLength > bytes.length)
    return null;

  const values: number[] = [];
  for (let index = 0; index < count; index++) {
    const offset = valueOffset + index * size;
    switch (type) {
      case TiffType.Byte:
      case TiffType.Ascii:
      case TiffType.Undefined:
        values.push(bytes[offset]);
        break;
      case TiffType.SByte:
        values.push(bytes[offset] << 24 >> 24);
        break;
      case TiffType.Short:
        values.push(reader.readUint16(bytes, offset));
        break;
      case TiffType.SShort:
        values.push(reader.readInt16(bytes, offset));
        break;
      case TiffType.Long:
        values.push(reader.readUint32(bytes, offset));
        break;
      case TiffType.SLong:
        values.push(reader.readInt32(bytes, offset));
        break;
    }
  }
  return values;
}

function createReader(bytes: Uint8Array): TiffReader | null {
  if (bytes.length < 8)
    return null;
  if (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00)
    return {
      littleEndian: true,
      readUint16: readUint16LE,
      readInt16: readInt16LE,
      readUint32: readUint32LE,
      readInt32: readInt32LE,
    };
  if (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a)
    return {
      littleEndian: false,
      readUint16: readUint16BE,
      readInt16: readInt16BE,
      readUint32: readUint32BE,
      readInt32: readInt32BE,
    };
  return null;
}

function typeSize(type: number): number {
  switch (type) {
    case TiffType.Byte:
    case TiffType.Ascii:
    case TiffType.SByte:
    case TiffType.Undefined:
      return 1;
    case TiffType.Short:
    case TiffType.SShort:
      return 2;
    case TiffType.Long:
    case TiffType.SLong:
      return 4;
    default:
      return 0;
  }
}

function first(tags: Map<number, number[]>, tag: TiffTag): number | undefined {
  return tags.get(tag)?.[0];
}

function normalizeBitsPerSample(values: number[] | undefined, count: number): number[] {
  if (values?.length)
    return Array.from({ length: Math.max(1, count) }, (_, index) => values[index] ?? values[0]);
  return Array.from({ length: Math.max(1, count) }, () => 1);
}

function isTiff(bytes: Uint8Array, extension?: string | null): boolean {
  const normalized = (extension ?? '').toLowerCase();
  if (normalized === '.tif' || normalized === '.tiff')
    return true;
  return bytes.length >= 4
    && ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00)
      || (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a));
}

function validDimension(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

async function rgbaToPngDataUri(rgba: Uint8Array, width: number, height: number): Promise<string | null> {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context)
    return null;

  context.putImageData(new ImageData(new Uint8ClampedArray(rgba), width, height), 0, 0);
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  const pngBytes = new Uint8Array(await blob.arrayBuffer());
  return `data:image/png;base64,${base64Encode(pngBytes)}`;
}

function readUint16BE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readUint16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readInt16BE(bytes: Uint8Array, offset: number): number {
  return readUint16BE(bytes, offset) << 16 >> 16;
}

function readInt16LE(bytes: Uint8Array, offset: number): number {
  return readUint16LE(bytes, offset) << 16 >> 16;
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function readInt32BE(bytes: Uint8Array, offset: number): number {
  return readUint32BE(bytes, offset) | 0;
}

function readInt32LE(bytes: Uint8Array, offset: number): number {
  return readUint32LE(bytes, offset) | 0;
}

function base64Encode(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0;
    const second = bytes[index + 1] ?? 0;
    const third = bytes[index + 2] ?? 0;
    const triplet = (first << 16) | (second << 8) | third;
    output += alphabet[(triplet >> 18) & 63];
    output += alphabet[(triplet >> 12) & 63];
    output += index + 1 < bytes.length ? alphabet[(triplet >> 6) & 63] : '=';
    output += index + 2 < bytes.length ? alphabet[triplet & 63] : '=';
  }
  return output;
}
