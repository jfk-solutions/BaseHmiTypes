import { HmiSelectionGroupBase } from "./HmiSelectionGroupBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiListBox extends HmiSelectionGroupBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiListBox;
  }
}
