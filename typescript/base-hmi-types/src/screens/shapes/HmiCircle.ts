import { HmiCircularShapeBase } from "./HmiCircularShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiCircle extends HmiCircularShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiCircle;
  }
}
