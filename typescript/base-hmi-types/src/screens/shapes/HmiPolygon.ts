import { HmiPointBasedShapeBase } from "./HmiPointBasedShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiPolygon extends HmiPointBasedShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiPolygon;
  }
}
