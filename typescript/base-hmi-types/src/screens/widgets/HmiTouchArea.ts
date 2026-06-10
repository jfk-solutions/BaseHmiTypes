import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiScreenItemBase } from "../base/HmiScreenItemBase.js";

export class HmiTouchArea extends HmiScreenItemBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiTouchArea;
  }
}
