import { HmiTextWidgetBase } from "./HmiTextWidgetBase.js";
import { HmiObjectType, HmiProperty } from "../base.js";
import { HmiDecimalPointMode } from "./HmiDecimalPointMode.js";

export class HmiIOField extends HmiTextWidgetBase {
  hotKey?: HmiProperty<string>;
  maskInput?: HmiProperty<boolean>;
  fillCharacters?: HmiProperty<string>;
  decimalPointMode?: HmiProperty<HmiDecimalPointMode>;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiIOField;
  }
}
