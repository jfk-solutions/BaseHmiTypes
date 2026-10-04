import type { HmiProperty } from "../base/HmiProperty.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiTextWidgetBase } from "./HmiTextWidgetBase.js";

export class HmiDateTimeField extends HmiTextWidgetBase {
  showDate?: HmiProperty<boolean>;
  showTime?: HmiProperty<boolean>;
  constructor() { super(); this.hmiObjectType = HmiObjectType.HmiDateTimeField; }
}
