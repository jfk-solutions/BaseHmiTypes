import { HmiProperty, staticProperty } from "../base.js";
import { HmiEllipse } from "./HmiEllipse.js";

export class HmiEllipseSegment extends HmiEllipse {
  startAngle: HmiProperty<number> = staticProperty(0);
  sweepAngle: HmiProperty<number> = staticProperty(0);
}
