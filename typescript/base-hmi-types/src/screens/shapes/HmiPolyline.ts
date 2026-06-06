import { HmiPointBasedShapeBase } from "./HmiPointBasedShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiPolyline extends HmiPointBasedShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiPolyline;
  }
}
