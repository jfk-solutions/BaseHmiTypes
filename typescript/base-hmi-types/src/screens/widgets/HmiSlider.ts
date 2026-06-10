import { HmiBar } from "./HmiBar.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiColor, HmiProperty } from "../base.js";

export class HmiSlider extends HmiBar {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiSlider;
  }

  thumbBackgroundColor?: HmiProperty<HmiColor>;
  thumbForegroundColor?: HmiProperty<HmiColor>;
}
