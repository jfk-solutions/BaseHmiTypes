import { HmiEllipticalShapeBase } from "./HmiEllipticalShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiEllipse extends HmiEllipticalShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiEllipse;
  }
}
