import { HmiProperty, staticProperty } from "../base.js";
import { HmiCircularShapeBase } from "./HmiCircularShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiCircularArc extends HmiCircularShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiCircularArc;
  }

  startAngle: HmiProperty<number> = staticProperty(0);
  sweepAngle: HmiProperty<number> = staticProperty(0);
}
