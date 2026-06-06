import { HmiSelectionGroupBase } from "./HmiSelectionGroupBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiCheckBoxGroup extends HmiSelectionGroupBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiCheckBoxGroup;
  }
}
