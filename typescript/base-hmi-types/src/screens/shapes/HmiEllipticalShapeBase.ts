import { HmiProperty, staticProperty } from "../base.js";
import { HmiCentricShapeBase } from "./HmiCentricShapeBase.js";

export abstract class HmiEllipticalShapeBase extends HmiCentricShapeBase {
  radiusX: HmiProperty<number> = staticProperty(0);
  radiusY: HmiProperty<number> = staticProperty(0);
}
