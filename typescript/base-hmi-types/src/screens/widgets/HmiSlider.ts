import { HmiBar } from "./HmiBar.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiSlider extends HmiBar {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiSlider;
  }
}
