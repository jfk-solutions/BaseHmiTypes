import type { HmiScreenBase } from "../../screens/base/HmiScreenBase.js";
import type { HmiScreenWindow } from "../../screens/screen/HmiScreenWindow.js";

export class HmiHtmlConvertOptions {
    /** Optional instance-aware resolution. An undefined result suppresses project fallback. */
    templateResolver?: (screen: HmiScreenBase, signal?: AbortSignal) => Promise<HmiScreenBase | undefined>;
    screenWindowResolver?: (window: HmiScreenWindow, signal?: AbortSignal) => Promise<HmiScreenBase | undefined>;
    /** Observes actual renderer dispatch, not per-property support. */
    itemDiagnostic?: (diagnostic: HmiHtmlItemDiagnostic) => void;
    includeMetaCharset = true;
    cultureLcid?: number;
    missingScreenPlaceholderCssClass = "hmi-missing-screen";
    unsupportedItemPlaceholderCssClass = "hmi-unsupported-item";
}


export class HmiHtmlItemDiagnostic {
  itemId?: string;
  itemName?: string;
  modelType?: string;
  hmiObjectType?: string;
  sourceFormat?: string;
  nativeTypeName?: string;
  nativeSubtype?: string;
  nativeClassName?: string;
  nativeClassId?: string;
  rendererRoute?: string;
  isPlaceholder = false;
  childCount = 0;
  sourcePropertyNames: string[] = [];
}
