import { HmiProperty } from "../base.js";
import { HmiTextWidgetBase } from "./HmiTextWidgetBase.js";

export class HmiSymbolicIOField extends HmiTextWidgetBase {
  mode?: HmiProperty<number>;
  showDropDownButton?: HmiProperty<boolean>;
  showDropDownList?: HmiProperty<boolean>;
}
