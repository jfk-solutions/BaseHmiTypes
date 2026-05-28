import { HmiProperty, staticProperty } from "../base.js";
import { HmiEllipticalShapeBase } from "./HmiEllipticalShapeBase.js";

export class HmiEllipticalArc extends HmiEllipticalShapeBase {
  startAngle: HmiProperty<number> = staticProperty(0);
  sweepAngle: HmiProperty<number> = staticProperty(0);
}
