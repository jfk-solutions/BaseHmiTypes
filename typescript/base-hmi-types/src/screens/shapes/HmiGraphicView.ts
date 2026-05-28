import { HmiImageSource, HmiProperty } from "../base.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";

export class HmiGraphicView extends HmiSurfaceShapeBase {
  source?: HmiProperty<string>;
  image?: HmiProperty<HmiImageSource>;
  alternateImage?: HmiProperty<HmiImageSource>;
  graphicStretchMode?: HmiProperty<number>;
}
