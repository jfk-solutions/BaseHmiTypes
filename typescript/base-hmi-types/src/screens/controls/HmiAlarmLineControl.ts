import { HmiProperty } from "../base.js";
import { HmiSimpleScreenItemBase } from "../base/HmiSimpleScreenItemBase.js";

export class HmiAlarmLineControl extends HmiSimpleScreenItemBase {
  suppressFlashing?: HmiProperty<boolean>;
  acknowledgmentFlashingRate?: HmiProperty<number>;
  resetFlashingRate?: HmiProperty<number>;
  numberOfRows?: HmiProperty<number>;
}
