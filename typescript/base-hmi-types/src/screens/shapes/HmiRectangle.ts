import { HmiProperty } from "../base.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";

export class HmiRectangle extends HmiSurfaceShapeBase {
  topLeftRadius?: HmiProperty<number>;
  topRightRadius?: HmiProperty<number>;
  bottomLeftRadius?: HmiProperty<number>;
  bottomRightRadius?: HmiProperty<number>;
}
