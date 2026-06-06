import { HmiSelectionGroupBase } from "./HmiSelectionGroupBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiComboBox extends HmiSelectionGroupBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiComboBox;
  }
}
