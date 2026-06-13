import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiFont, HmiHorizontalAlignment, HmiProperty, HmiVerticalAlignment } from "../base.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiText extends HmiSurfaceShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiText;
  }

  text?: HmiProperty<HmiMultilingualText>;
  alternateText?: HmiProperty<HmiMultilingualText>;
  textWrapping?: HmiProperty<number>;
  textTrimming?: HmiProperty<number>;
  font?: HmiFont;
  horizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  verticalAlignment?: HmiProperty<HmiVerticalAlignment>;
}
