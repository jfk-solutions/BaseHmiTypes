import { HmiColor, HmiImageSource, HmiProperty } from "../base.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiGraphicView extends HmiSurfaceShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiGraphicView;
  }

  source?: HmiProperty<string>;
  image?: HmiProperty<HmiImageSource>;
  alternateImage?: HmiProperty<HmiImageSource>;
  imageScaled?: HmiProperty<boolean>;
  imageBlink?: HmiProperty<boolean>;
  imageColor?: HmiProperty<HmiColor>;
  imageBackgroundColor?: HmiProperty<HmiColor>;
  imageBackgroundTransparent?: HmiProperty<boolean>;
  graphicStretchMode?: HmiProperty<number>;
}
