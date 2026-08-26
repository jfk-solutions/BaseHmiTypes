import { HmiColor, HmiProperty } from "../base.js";

export enum HmiThresholdValueMode {
  Absolute = "Absolute",
  Percentage = "Percentage",
}

export class HmiThreshold {
  value?: HmiProperty<number>;
  color?: HmiProperty<HmiColor>;
  blink?: HmiProperty<boolean>;
}
