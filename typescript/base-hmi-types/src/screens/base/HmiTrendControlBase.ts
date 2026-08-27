import { HmiControlWindowBase } from "./HmiControlWindowBase.js";
import { HmiProperty } from "./HmiProperty.js";
import { HmiTrendPen } from "./HmiTrendPen.js";

export abstract class HmiTrendControlBase extends HmiControlWindowBase {
  readonly pens: HmiTrendPen[] = [];
  minimumValue?: HmiProperty<number>;
  maximumValue?: HmiProperty<number>;
}
