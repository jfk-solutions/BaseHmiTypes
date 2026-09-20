import { HmiProperty } from "../base.js";

export class HmiAlarmIndicatorSegment {
  index = 0;
  width?: HmiProperty<number>;
  messageClasses?: HmiProperty<number[]>;
}
