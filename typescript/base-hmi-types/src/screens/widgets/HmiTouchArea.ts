import { HmiScreenModelBase } from "../base/HmiScreenModelBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiTouchArea extends HmiScreenModelBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiTouchArea;
  }
}
