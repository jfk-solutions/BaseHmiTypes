import type { HmiMultilingualText } from "../common/HmiMultilingualText.js";
import type { HmiRecipeBinaryValue, HmiRecipeReference } from "./HmiRecipe.js";

export enum HmiRecipeValueKind {
  Null = "Null", Scalar = "Scalar", Map = "Map", Array = "Array", Binary = "Binary",
  Reference = "Reference", Unsupported = "Unsupported", Recursive = "Recursive", DepthLimit = "DepthLimit", Text = "Text",
}

/** Detached stored value tree; positions do not imply PLC bounds. */
export class HmiRecipeStructuredValue {
  kind = HmiRecipeValueKind.Null;
  sourceType?: string;
  value?: string;
  text?: HmiMultilingualText;
  sourceTextFlags?: number;
  binary?: HmiRecipeBinaryValue;
  reference?: HmiRecipeReference;
  readonly entries: HmiRecipeStructuredEntry[] = [];
  readonly items: HmiRecipeStructuredValue[] = [];
}

export class HmiRecipeStructuredEntry {
  key = "";
  value = new HmiRecipeStructuredValue();
}
