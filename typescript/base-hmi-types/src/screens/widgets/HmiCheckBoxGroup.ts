import { HmiSelectionGroupBase } from "./HmiSelectionGroupBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base.js";

export class HmiCheckBoxGroup extends HmiSelectionGroupBase {
  /** A 32-bit selection mask; bit zero selects the first field. Overrides selectedIndex when set. */
  selectedFields?: HmiProperty<number>;
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiCheckBoxGroup;
  }
}
