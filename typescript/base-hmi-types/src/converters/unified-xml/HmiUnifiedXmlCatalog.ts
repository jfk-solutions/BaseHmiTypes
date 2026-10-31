import { unifiedXmlCatalogId, unifiedXmlCatalogXml } from "./HmiUnifiedXmlContract.g.js";
/** The shared format definition has no Siemens-major-version selection. */
export class HmiUnifiedXmlCatalog {
  static readonly id = unifiedXmlCatalogId;
  static readonly url = new URL("../../catalogs/unified/catalog.xml.gz", import.meta.url);
  static async load(id: string = this.id): Promise<string> {
    if (id !== this.id) throw new Error("Unsupported Unified format catalog: " + id);
    return unifiedXmlCatalogXml;
  }
  static async loadFromUrl(url: string | URL = this.url): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Catalog request failed: HTTP ${response.status}`);
    return this.read(new Uint8Array(await response.arrayBuffer()));
  }
  static async read(data: Uint8Array): Promise<string> {
    const output = await new Response(new Blob([new Uint8Array(data)]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
    const xml = new TextDecoder("utf-8", {fatal:true}).decode(output);
    if (!xml.includes(`id="${this.id}"`)) throw new Error("Unsupported Unified format catalog.");
    return xml;
  }
}
