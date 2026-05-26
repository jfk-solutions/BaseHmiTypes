import { HmiPoint } from "./HmiPoint.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";

export abstract class HmiPointBasedShapeBase extends HmiSurfaceShapeBase {
  readonly points: HmiPoint[] = [];
}
