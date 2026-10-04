import { HmiColor, HmiProperty } from "../base.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiNcKeyboardControl extends HmiControlWindowBase {
  constructor() { super(); this.hmiObjectType = HmiObjectType.HmiNcKeyboardControl; }
  keyboardStyle?: HmiProperty<number>;
  keyboardBackgroundColor?: HmiProperty<HmiColor>;
  readonly normalKeys = new HmiNcKeyboardKeyAppearance();
  readonly specialKeys = new HmiNcKeyboardKeyAppearance();
  readonly enterKey = new HmiNcKeyboardKeyAppearance();
}

export class HmiNcKeyboardKeyAppearance {
  normalBackgroundColor?: HmiProperty<HmiColor>;
  normalForegroundColor?: HmiProperty<HmiColor>;
  pressedBackgroundColor?: HmiProperty<HmiColor>;
  pressedForegroundColor?: HmiProperty<HmiColor>;
}
