import { HmiTextWidgetBase } from "./HmiTextWidgetBase.js";
import { HmiObjectType, HmiProperty } from "../base.js";
import { HmiDecimalPointMode } from "./HmiDecimalPointMode.js";
import { HmiEnterHandshakeSettings } from "./HmiEnterHandshakeSettings.js";
import { HmiInputPopupMode } from "./HmiInputPopupMode.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiConfirmationMode } from "./HmiConfirmationMode.js";

export class HmiIOField extends HmiTextWidgetBase {
  hotKey?: HmiProperty<string>;
  maskInput?: HmiProperty<boolean>;
  fillCharacters?: HmiProperty<string>;
  decimalPointMode?: HmiProperty<HmiDecimalPointMode>;
  polaritySignal?: HmiProperty<number>;
  enterHandshake?: HmiEnterHandshakeSettings;
  popupMode?: HmiProperty<HmiInputPopupMode>;
  takeFocusOnPress?: HmiProperty<boolean>;
  defaultData?: HmiProperty<string>;
  displayOnScreenKeyboard?: HmiProperty<boolean>;
  onScreenKeyboardCaption?: HmiProperty<HmiMultilingualText>;
  continuouslyUpdate?: HmiProperty<boolean>;
  discardInputOnFocusLost?: HmiProperty<boolean>;
  remark?: HmiProperty<HmiMultilingualText>;
  confirmationMode?: HmiProperty<HmiConfirmationMode>;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiIOField;
  }
}
