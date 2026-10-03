import { HmiSelectionGroupBase } from "./HmiSelectionGroupBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import type { HmiProperty } from "../base.js";

export class HmiListBox extends HmiSelectionGroupBase {
  /** Selected entries as a 32-bit mask, with bit zero selecting the first entry. When absent, selection is by value. */
  selectedFields?: HmiProperty<number>;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiListBox;
  }
}
