import { HmiProperty, staticProperty } from "../base.js";
import { HmiShapeBase } from "./HmiShapeBase.js";

export abstract class HmiCentricShapeBase extends HmiShapeBase {
  /** Draws strokes wider than one pixel inside the circular or elliptical outline instead of centered on it. */
  drawStrokeInsideFrame?: HmiProperty<boolean>;
  centerX: HmiProperty<number> = staticProperty(0);
  centerY: HmiProperty<number> = staticProperty(0);
}
