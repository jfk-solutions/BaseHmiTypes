import type { HmiRecipeBinaryValue, HmiRecipeReference } from "./HmiRecipe.js";

export enum HmiRecipeValueKind {
  Null = "Null", Scalar = "Scalar", Map = "Map", Array = "Array", Binary = "Binary",
  Reference = "Reference", Unsupported = "Unsupported", Recursive = "Recursive", DepthLimit = "DepthLimit",
}

/** Detached stored value tree; positions do not imply PLC bounds. */
export class HmiRecipeStructuredValue {
  kind = HmiRecipeValueKind.Null;
  sourceType?: string;
  value?: string;
  binary?: HmiRecipeBinaryValue;
  reference?: HmiRecipeReference;
  readonly entries: HmiRecipeStructuredEntry[] = [];
  readonly items: HmiRecipeStructuredValue[] = [];
}

export class HmiRecipeStructuredEntry {
  key = "";
  value = new HmiRecipeStructuredValue();
}
