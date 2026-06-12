import { HmiImage } from "../../images/HmiImage.js";
import { HmiColor } from "./HmiColor.js";
import { HmiObjectType } from "./HmiObjectType.js";
import { HmiOcxControl } from "./HmiOcxControl.js";
import { HmiProperty } from "./HmiProperty.js";
import {
  HmiSymbolLibraryBackFillStyle,
  HmiSymbolLibraryBlinkMode,
  HmiSymbolLibraryBlinkSpeed,
  HmiSymbolLibraryFillColorMode,
  HmiSymbolLibraryFlip,
  HmiSymbolLibraryRotation,
} from "./HmiSymbolLibraryEnums.js";

export class HmiSymbolLibraryControl extends HmiOcxControl {
  static readonly siemensSymbolLibraryGuid = "3cd08690-fff0-11d3-b482-00105abbfd73";

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiSymbolLibraryControl;
    this.ocxGuid = HmiSymbolLibraryControl.siemensSymbolLibraryGuid;
    this.ocxName = "Siemens HMI Symbol Library";
  }

  symbolId?: string;
  symbol?: HmiImage;
  symbolAppearance?: HmiProperty<HmiSymbolLibraryFillColorMode>;
  fillColorMode?: HmiProperty<HmiSymbolLibraryFillColorMode>;
  blinkMode?: HmiProperty<HmiSymbolLibraryBlinkMode>;
  stretch?: HmiProperty<boolean>;
  fixedAspectRatio?: HmiProperty<boolean>;
  flip?: HmiProperty<HmiSymbolLibraryFlip>;
  fillColor?: HmiProperty<HmiColor>;
  blinkSpeed?: HmiProperty<HmiSymbolLibraryBlinkSpeed>;
  blinkColor?: HmiProperty<HmiColor>;
  rotation?: HmiProperty<HmiSymbolLibraryRotation>;
  backColor?: HmiProperty<HmiColor>;
  backFillStyle?: HmiProperty<HmiSymbolLibraryBackFillStyle>;
  declare padding?: HmiProperty<number>;
  changeMouseCursor?: HmiProperty<boolean>;
  foreColor?: HmiProperty<HmiColor>;
  flashing?: HmiProperty<number>;
  flashingOnLimitViolation?: HmiProperty<boolean>;
  aboveUpperLimitColor?: HmiProperty<HmiColor>;
  belowLowerLimitColor?: HmiProperty<HmiColor>;
}
