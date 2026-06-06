import { HmiTextWidgetBase } from "./HmiTextWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiLabel extends HmiTextWidgetBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiLabel;
  }
}
