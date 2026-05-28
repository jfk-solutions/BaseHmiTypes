import { HmiProperty, staticProperty } from "../base.js";
import { HmiCircularShapeBase } from "./HmiCircularShapeBase.js";

export class HmiCircularArc extends HmiCircularShapeBase {
  startAngle: HmiProperty<number> = staticProperty(0);
  sweepAngle: HmiProperty<number> = staticProperty(0);
}
