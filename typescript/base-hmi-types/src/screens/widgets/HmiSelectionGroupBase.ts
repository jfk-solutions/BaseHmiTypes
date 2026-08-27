import { HmiColor, HmiImageSource, HmiProperty } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";
import { HmiState } from "./HmiState.js";
import { HmiEnterHandshakeSettings } from "./HmiEnterHandshakeSettings.js";
import { HmiStateTriggerMode } from "./HmiStateTriggerMode.js";

export interface HmiSelectionGroupItem {
  text?: string;
  image?: HmiImageSource;
  imageName?: string;
}

export abstract class HmiSelectionGroupBase extends HmiWidgetBase {
  readonly states: HmiState[] = [];
  configuredStateCount?: HmiProperty<number>;
  stateTriggerMode?: HmiProperty<HmiStateTriggerMode>;
  value?: HmiProperty<number>;
  readonly items: HmiSelectionGroupItem[] = [];
  selectedIndex?: HmiProperty<number>;
  selectionMode?: HmiProperty<number>;
  wrapAround?: HmiProperty<boolean>;
  writeOnEnter?: HmiProperty<boolean>;
  enterHandshake?: HmiEnterHandshakeSettings;
  selectionItemHeight?: HmiProperty<number>;
  selectionBackgroundColor?: HmiProperty<HmiColor>;
  selectionForegroundColor?: HmiProperty<HmiColor>;
  evenRowBackgroundColor?: HmiProperty<HmiColor>;
  selectionBorderColor?: HmiProperty<HmiColor>;
  selectionBorderWidth?: HmiProperty<number>;
}
