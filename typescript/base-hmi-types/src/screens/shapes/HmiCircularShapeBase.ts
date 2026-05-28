import { HmiProperty, staticProperty } from "../base.js";
import { HmiCentricShapeBase } from "./HmiCentricShapeBase.js";

export abstract class HmiCircularShapeBase extends HmiCentricShapeBase {
  radius: HmiProperty<number> = staticProperty(0);
}
