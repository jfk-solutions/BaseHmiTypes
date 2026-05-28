import { HmiProperty } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";

export class HmiClock extends HmiWidgetBase {
  showDate?: HmiProperty<boolean>;
  showTime?: HmiProperty<boolean>;
  showHours?: HmiProperty<boolean>;
  showMinutes?: HmiProperty<boolean>;
  showSeconds?: HmiProperty<boolean>;
  timeZone?: HmiProperty<string>;
}
