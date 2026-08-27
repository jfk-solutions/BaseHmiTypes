import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiColor, HmiProperty } from "../base.js";
import { HmiButtonBase } from "./HmiButtonBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiSwitchType } from "./HmiSwitchType.js";
import { HmiToggleSwitchShapeType } from "./HmiToggleSwitchShapeType.js";

export class HmiToggleSwitch extends HmiButtonBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiToggleSwitch;
  }

  mode?: HmiProperty<HmiSwitchType>;
  header?: HmiProperty<boolean>;
  headerText?: HmiProperty<HmiMultilingualText>;
  remark?: HmiProperty<HmiMultilingualText>;
  shapeType?: HmiProperty<HmiToggleSwitchShapeType>;
  offThumbColor?: HmiProperty<HmiColor>;
  onThumbColor?: HmiProperty<HmiColor>;
}
