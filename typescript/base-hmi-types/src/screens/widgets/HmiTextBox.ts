import { HmiLabel } from "./HmiLabel.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiTextBox extends HmiLabel {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiTextBox;
  }
}
