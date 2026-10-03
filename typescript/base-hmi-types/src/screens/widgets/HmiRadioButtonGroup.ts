import { HmiSelectionGroupBase } from "./HmiSelectionGroupBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base.js";

export class HmiRadioButtonGroup extends HmiSelectionGroupBase {
  /** A single-bit 32-bit selection mask; zero selects none, and multiple set bits are invalid. */
  selectedFields?: HmiProperty<number>;
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiRadioButtonGroup;
  }
}
