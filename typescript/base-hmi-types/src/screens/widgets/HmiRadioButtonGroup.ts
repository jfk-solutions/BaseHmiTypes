import { HmiSelectionGroupBase } from "./HmiSelectionGroupBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiRadioButtonGroup extends HmiSelectionGroupBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiRadioButtonGroup;
  }
}
