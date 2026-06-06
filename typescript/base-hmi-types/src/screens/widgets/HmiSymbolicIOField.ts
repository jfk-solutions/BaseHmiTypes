import { HmiProperty } from "../base.js";
import { HmiTextWidgetBase } from "./HmiTextWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiSymbolicIOField extends HmiTextWidgetBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiSymbolicIOField;
  }

  mode?: HmiProperty<number>;
  showDropDownButton?: HmiProperty<boolean>;
  showDropDownList?: HmiProperty<boolean>;
}
