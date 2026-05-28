import { HmiProperty } from "../base.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";

export class HmiText extends HmiSurfaceShapeBase {
  text?: HmiProperty<string>;
  alternateText?: HmiProperty<string>;
  textWrapping?: HmiProperty<number>;
  textTrimming?: HmiProperty<number>;
}
