import { HmiFont, HmiHorizontalAlignment, HmiProperty, HmiVerticalAlignment } from "../base.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiText extends HmiSurfaceShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiText;
  }

  text?: HmiProperty<string>;
  alternateText?: HmiProperty<string>;
  textWrapping?: HmiProperty<number>;
  textTrimming?: HmiProperty<number>;
  font?: HmiFont;
  horizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  verticalAlignment?: HmiProperty<HmiVerticalAlignment>;
}
