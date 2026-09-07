import { HmiColor, HmiGradientDirection, HmiProperty } from "../base.js";

export enum HmiThresholdValueMode {
  Absolute = "Absolute",
  Percentage = "Percentage",
}

export class HmiThreshold {
  index?: number;
  value?: HmiProperty<number>;
  color?: HmiProperty<HmiColor>;
  blink?: HmiProperty<boolean>;
  endColor?: HmiProperty<HmiColor>;
  gradientStop?: HmiProperty<number>;
  gradientAxis?: string;
  gradientDirection?: HmiGradientDirection;
}
