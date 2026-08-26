import { HmiTextWidgetBase } from "./HmiTextWidgetBase.js";
import { HmiObjectType, HmiProperty } from "../base.js";

export class HmiIOField extends HmiTextWidgetBase {
  hotKey?: HmiProperty<string>;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiIOField;
  }
}
