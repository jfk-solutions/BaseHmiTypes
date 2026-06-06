import { HmiProperty, staticProperty } from "../base.js";
import { HmiCircle } from "./HmiCircle.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiCircleSegment extends HmiCircle {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiCircleSegment;
  }

  startAngle: HmiProperty<number> = staticProperty(0);
  sweepAngle: HmiProperty<number> = staticProperty(0);
}
