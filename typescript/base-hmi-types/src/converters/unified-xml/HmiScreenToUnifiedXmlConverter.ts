import { HmiUnifiedXmlModelWriter } from "./HmiUnifiedXmlModelWriter.js";
import { unifiedXmlCatalogId, unifiedXmlCatalogXml } from "./HmiUnifiedXmlContract.g.js";
import type { HmiScreenBase } from "../../screens/base/HmiScreenBase.js";
export interface HmiUnifiedXmlDiagnostic { readonly path: string; readonly message: string; }
export interface HmiUnifiedXmlExportResult { readonly xml: string; readonly complete: false; readonly diagnostics: readonly HmiUnifiedXmlDiagnostic[]; }
/** Exports editable engineering values using the shared Unified format contract. */
export class HmiScreenToUnifiedXmlConverter {
  static readonly catalogId = unifiedXmlCatalogId;
  static readonly namespace = "urn:s7mcp:wincc-unified:2";
  static readonly contractNamespace = "urn:s7mcp:wincc-unified:2:contract";
  constructor(private readonly catalogXml?: string) {}
  convert(screen: HmiScreenBase, deviceName: string, defaultCultureLcid?: number): HmiUnifiedXmlExportResult {
    if (!screen || !screen.name?.trim() || !deviceName?.trim()) throw new Error("A screen name and device name are required.");
    return new HmiUnifiedXmlModelWriter(this.catalogXml ?? unifiedXmlCatalogXml, defaultCultureLcid).convert(screen, deviceName);
  }
}

// Explicit LCID mapping; unsupported languages produce diagnostics rather than guesses.
export function unifiedCultureName(lcid?: number): string {
  const names: Record<number, string> = { 1028: "zh-TW", 1029: "cs-CZ", 1030: "da-DK", 1031: "de-DE", 1032: "el-GR",
    1033: "en-US", 1035: "fi-FI", 1036: "fr-FR", 1038: "hu-HU", 1040: "it-IT", 1041: "ja-JP", 1042: "ko-KR",
    1043: "nl-NL", 1044: "nb-NO", 1045: "pl-PL", 1046: "pt-BR", 1049: "ru-RU", 1053: "sv-SE", 1055: "tr-TR",
    2052: "zh-CN", 2057: "en-GB", 2070: "pt-PT", 3082: "es-ES" };
  if (lcid === undefined || !names[lcid]) throw new Error("Unsupported or unspecified culture LCID: " + lcid);
  return names[lcid];
}
