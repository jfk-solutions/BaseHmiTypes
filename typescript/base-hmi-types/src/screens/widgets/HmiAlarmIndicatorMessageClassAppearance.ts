import { HmiProperty } from "../base.js";

export class HmiAlarmIndicatorMessageClassAppearance {
  index = 0;
  isTextFlashingRequired?: HmiProperty<boolean>;
  isBackgroundFlashingRequired?: HmiProperty<boolean>;
}
