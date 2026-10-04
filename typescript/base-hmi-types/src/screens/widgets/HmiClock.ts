import { HmiProperty } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import type { HmiColor } from "../base/HmiColor.js";

export class HmiClock extends HmiWidgetBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiClock;
  }

  analog?: HmiProperty<boolean>;
  /** 0 solid, 1 transparent frame around a filled analog dial, 2 transparent. */
  backgroundStyle?: HmiProperty<number>;
  showTicks?: HmiProperty<boolean>;
  ticksColor?: HmiProperty<HmiColor>;
  handFillColor?: HmiProperty<HmiColor>;
  outlinedHands?: HmiProperty<boolean>;
  /** Hand length as a percentage of dial radius. Preview defaults: 50, 70, 80. */
  hourHandLengthPercent?: HmiProperty<number>;
  minuteHandLengthPercent?: HmiProperty<number>;
  secondHandLengthPercent?: HmiProperty<number>;
  /** Hand half-width as a percentage of its length. Preview defaults: 10, 8, 2. */
  hourHandHalfWidthPercent?: HmiProperty<number>;
  minuteHandHalfWidthPercent?: HmiProperty<number>;
  secondHandHalfWidthPercent?: HmiProperty<number>;
  numberStyle?: HmiProperty<number>;
  showDate?: HmiProperty<boolean>;
  showTime?: HmiProperty<boolean>;
  showHours?: HmiProperty<boolean>;
  showMinutes?: HmiProperty<boolean>;
  showSeconds?: HmiProperty<boolean>;
  /** Product-specific date/time format retained without locale-dependent conversion. */
  format?: HmiProperty<string>;
  timeZone?: HmiProperty<string>;
}
