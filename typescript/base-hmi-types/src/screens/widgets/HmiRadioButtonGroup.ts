import { HmiSelectionGroupBase } from "./HmiSelectionGroupBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base.js";

export class HmiRadioButtonGroup extends HmiSelectionGroupBase {
  /** True places the indicator to the right of its caption; false/omitted keeps it on the left. */
  indicatorOnRight?: HmiProperty<boolean>;
  /** For borders wider than one pixel, false centers on the frame; true/omitted draws inside. */
  drawStrokeInsideFrame?: HmiProperty<boolean>;
  /** A single-bit 32-bit selection mask; zero selects none, and multiple set bits are invalid. */
  selectedFields?: HmiProperty<number>;
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiRadioButtonGroup;
  }
}
