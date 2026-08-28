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
  /** Read-only runtime value that selects a state while remotely operated. */
  indicator?: HmiProperty<number>;
  readonly items: HmiSelectionGroupItem[] = [];
  selectedIndex?: HmiProperty<number>;
  selectionMode?: HmiProperty<number>;
  wrapAround?: HmiProperty<boolean>;
  writeOnEnter?: HmiProperty<boolean>;
  /** A nonzero read-only runtime value enables remote control; zero leaves operator control. */
  remoteAccess?: HmiProperty<number>;
  /** Write target receiving the first visible state's value when the list scrolls. */
  topPosition?: HmiProperty<number>;
  /** Array write target receiving all visible state values when the list scrolls. */
  visibleStates?: HmiProperty<readonly number[]>;
  enterHandshake?: HmiEnterHandshakeSettings;
  selectionItemHeight?: HmiProperty<number>;
  selectionBackgroundColor?: HmiProperty<HmiColor>;
  selectionForegroundColor?: HmiProperty<HmiColor>;
  evenRowBackgroundColor?: HmiProperty<HmiColor>;
  selectionBorderColor?: HmiProperty<HmiColor>;
  selectionBorderWidth?: HmiProperty<number>;
}
