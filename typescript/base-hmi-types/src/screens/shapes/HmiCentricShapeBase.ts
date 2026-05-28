import { HmiProperty, staticProperty } from "../base.js";
import { HmiShapeBase } from "./HmiShapeBase.js";

export abstract class HmiCentricShapeBase extends HmiShapeBase {
  centerX: HmiProperty<number> = staticProperty(0);
  centerY: HmiProperty<number> = staticProperty(0);
}
