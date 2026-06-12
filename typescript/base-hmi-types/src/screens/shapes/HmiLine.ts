import { HmiProperty } from "../base.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiPointCoordinateSpace } from "./HmiPointCoordinateSpace.js";

export class HmiLine extends HmiSurfaceShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiLine;
  }

  x1?: HmiProperty<number>;
  y1?: HmiProperty<number>;
  x2?: HmiProperty<number>;
  y2?: HmiProperty<number>;
  pointCoordinateSpace = HmiPointCoordinateSpace.ItemRelative;
}
