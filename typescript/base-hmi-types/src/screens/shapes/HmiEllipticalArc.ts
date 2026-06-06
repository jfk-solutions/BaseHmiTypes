import { HmiProperty, staticProperty } from "../base.js";
import { HmiEllipticalShapeBase } from "./HmiEllipticalShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiEllipticalArc extends HmiEllipticalShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiEllipticalArc;
  }

  startAngle: HmiProperty<number> = staticProperty(0);
  sweepAngle: HmiProperty<number> = staticProperty(0);
}
