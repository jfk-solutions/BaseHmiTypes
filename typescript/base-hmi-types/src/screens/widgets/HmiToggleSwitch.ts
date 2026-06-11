import { HmiProperty } from "../base.js";
import { HmiButtonBase } from "./HmiButtonBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiSwitchType } from "./HmiSwitchType.js";

export class HmiToggleSwitch extends HmiButtonBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiToggleSwitch;
  }

  mode?: HmiProperty<HmiSwitchType>;
  header?: HmiProperty<boolean>;
  headerText?: HmiProperty<string>;
}
