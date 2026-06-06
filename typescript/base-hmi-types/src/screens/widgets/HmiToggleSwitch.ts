import { HmiButton } from "./HmiButton.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiToggleSwitch extends HmiButton {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiToggleSwitch;
  }
}
