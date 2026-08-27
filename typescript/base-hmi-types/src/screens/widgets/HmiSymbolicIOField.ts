import { HmiProperty } from "../base.js";
import { HmiTextWidgetBase } from "./HmiTextWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiState } from "./HmiState.js";
import { HmiStateTriggerMode } from "./HmiStateTriggerMode.js";

export class HmiSymbolicIOField extends HmiTextWidgetBase {
  readonly states: HmiState[] = [];
  configuredStateCount?: HmiProperty<number>;
  stateTriggerMode?: HmiProperty<HmiStateTriggerMode>;
  value?: HmiProperty<number>;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiSymbolicIOField;
  }

  mode?: HmiProperty<number>;
  showDropDownButton?: HmiProperty<boolean>;
  showDropDownList?: HmiProperty<boolean>;
}
