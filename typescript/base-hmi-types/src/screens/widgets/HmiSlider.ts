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
  /** Configured small-change increment; preview rendering does not perform process writes. */
  stepSize?: HmiProperty<number>;
  trackHighBackgroundColor?: HmiProperty<HmiColor>;
  trackLowBackgroundColor?: HmiProperty<HmiColor>;
  highStopColor?: HmiProperty<HmiColor>;
  lowStopColor?: HmiProperty<HmiColor>;
}
