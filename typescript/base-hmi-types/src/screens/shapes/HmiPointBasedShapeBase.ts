import { HmiPoint } from "./HmiPoint.js";
import { HmiPointCoordinateSpace } from "./HmiPointCoordinateSpace.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";

export abstract class HmiPointBasedShapeBase extends HmiSurfaceShapeBase {
  pointCoordinateSpace = HmiPointCoordinateSpace.ItemRelative;
  readonly points: HmiPoint[] = [];
}
