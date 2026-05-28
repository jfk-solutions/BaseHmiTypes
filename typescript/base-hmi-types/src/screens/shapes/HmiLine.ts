import { HmiProperty } from "../base.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";

export class HmiLine extends HmiSurfaceShapeBase {
  x1?: HmiProperty<number>;
  y1?: HmiProperty<number>;
  x2?: HmiProperty<number>;
  y2?: HmiProperty<number>;
}
