import { HmiScreenToUnifiedXmlConverter } from "./HmiScreenToUnifiedXmlConverter.js";

/** Loads the catalog with browser APIs; no Node.js or third-party runtime dependencies. */
export class HmiUnifiedXmlCatalog {
  static async load(id: string): Promise<string> {
    if (!/^[a-f0-9]{64}$/.test(id)) throw new Error("Invalid Unified catalog identifier.");
    return this.loadV21(new URL(`../../catalogs/unified-v21/${id}.xml.gz`, import.meta.url));
  }
  /** Hosts may serve this asset from another location and pass its URL to loadV21. */
  static readonly v21Url = new URL(
    `../../catalogs/unified-v21/${HmiScreenToUnifiedXmlConverter.catalogId}.xml.gz`, import.meta.url);

  /** Fetches a gzip asset. Serve .gz as binary data without Content-Encoding: gzip. */
  static async loadV21(url: string | URL = this.v21Url): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Catalog request failed: HTTP ${response.status}`);
    return this.readV21(new Uint8Array(await response.arrayBuffer()));
  }

  /** Decompresses gzip bytes already loaded by the host. */
  static async readV21(data: Uint8Array): Promise<string> {
    if (typeof DecompressionStream === "undefined")
      throw new Error("This browser requires built-in DecompressionStream support to load gzip catalogs.");
    // Copy to an ArrayBuffer-backed view suitable for Blob across TypeScript DOM library versions.
    const input = new Blob([new Uint8Array(data)]).stream();
    const output = await new Response(input.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
    return new TextDecoder("utf-8", { fatal: true }).decode(output);
  }
}
