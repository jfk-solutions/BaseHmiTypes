import { HmiScreenModelBase, HmiSimpleScreenItemBase } from "./base.js";

export class HmiTouchArea extends HmiScreenModelBase {}

export abstract class HmiWidgetBase extends HmiSimpleScreenItemBase {}

export class HmiButton extends HmiWidgetBase {
  text?: string;
}

export class HmiToggleSwitch extends HmiButton {}

export class HmiClock extends HmiWidgetBase {}

export abstract class HmiScaleWidgetBase extends HmiWidgetBase {}

export abstract class HmiSelectionGroupBase extends HmiWidgetBase {
  readonly items: string[] = [];
}

export abstract class HmiTextWidgetBase extends HmiWidgetBase {
  text?: string;
}

export class HmiBar extends HmiScaleWidgetBase {}

export class HmiSlider extends HmiBar {}

export class HmiGauge extends HmiScaleWidgetBase {}

export class HmiCheckBoxGroup extends HmiSelectionGroupBase {}

export class HmiComboBox extends HmiSelectionGroupBase {}

export class HmiListBox extends HmiSelectionGroupBase {}

export class HmiRadioButtonGroup extends HmiSelectionGroupBase {}

export class HmiIOField extends HmiTextWidgetBase {}

export class HmiLabel extends HmiTextWidgetBase {}

export class HmiTextBox extends HmiLabel {}

export class HmiSymbolicIOField extends HmiTextWidgetBase {}

export class HmiAlarmIndicator extends HmiSimpleScreenItemBase {}
