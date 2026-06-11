import { HmiProperty } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiClock extends HmiWidgetBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiClock;
  }

  analog?: HmiProperty<boolean>;
  numberStyle?: HmiProperty<number>;
  showDate?: HmiProperty<boolean>;
  showTime?: HmiProperty<boolean>;
  showHours?: HmiProperty<boolean>;
  showMinutes?: HmiProperty<boolean>;
  showSeconds?: HmiProperty<boolean>;
  timeZone?: HmiProperty<string>;
}
