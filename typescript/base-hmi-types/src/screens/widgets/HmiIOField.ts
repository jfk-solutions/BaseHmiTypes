import { HmiTextWidgetBase } from "./HmiTextWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiIOField extends HmiTextWidgetBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiIOField;
  }
}
