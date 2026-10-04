import { HmiColor, HmiHorizontalAlignment, HmiImageSource, HmiProperty, HmiVerticalAlignment } from "../base.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiThickness } from "../base/HmiThickness.js";

export class HmiGraphicView extends HmiSurfaceShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiGraphicView;
  }

  source?: HmiProperty<string>;
  image?: HmiProperty<HmiImageSource>;
  alternateImage?: HmiProperty<HmiImageSource>;
  imageScaled?: HmiProperty<boolean>;
  /** Additional image extents outside the logical frame. The source image includes these extents. */
  imageOverflowPadding?: HmiThickness;
  imageBlink?: HmiProperty<boolean>;
  imageColor?: HmiProperty<HmiColor>;
  imageBackgroundColor?: HmiProperty<HmiColor>;
  imageBackgroundTransparent?: HmiProperty<boolean>;
  imageHorizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  imageVerticalAlignment?: HmiProperty<HmiVerticalAlignment>;
  graphicStretchMode?: HmiProperty<number>;
  /** Draws borders wider than one pixel inside the frame when true, or centered on it when false. */
  drawStrokeInsideFrame?: HmiProperty<boolean>;
}
