import { HmiProperty, staticProperty } from "../base.js";
import { HmiCircle } from "./HmiCircle.js";

export class HmiCircleSegment extends HmiCircle {
  startAngle: HmiProperty<number> = staticProperty(0);
  sweepAngle: HmiProperty<number> = staticProperty(0);
}
