import { HmiProperty } from "./HmiProperty.js";

export class HmiDynamicSvgProperty {
  name?: string;
  value?: HmiProperty<unknown>;
  dynamicReferenceId?: string;
  dynamicReferenceName?: string;
}
