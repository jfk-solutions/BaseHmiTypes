import { HmiProperty, staticProperty } from "../base.js";
import { HmiEllipse } from "./HmiEllipse.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiEllipseSegment extends HmiEllipse {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiEllipseSegment;
  }

  startAngle: HmiProperty<number> = staticProperty(0);
  sweepAngle: HmiProperty<number> = staticProperty(0);
}
