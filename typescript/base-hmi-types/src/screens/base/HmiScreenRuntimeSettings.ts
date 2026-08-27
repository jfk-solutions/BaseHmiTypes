import { HmiColor } from "./HmiColor.js";
import { HmiScreenCacheMode } from "./HmiScreenCacheMode.js";

export enum HmiScreenDisplayType {
  Replace = "Replace",
  Overlay = "Overlay",
  OnTop = "OnTop",
}

export enum HmiScreenPositionMode {
  CurrentPosition = "CurrentPosition",
  SpecifiedPixels = "SpecifiedPixels",
}

export enum HmiScreenSizeMode {
  CurrentSize = "CurrentSize",
  SpecifiedPixels = "SpecifiedPixels",
}

export enum HmiScreenResizeMode {
  None = "None",
  Pan = "Pan",
  Scale = "Scale",
}

export class HmiScreenRuntimeSettings {
  displayType?: HmiScreenDisplayType;
  positionMode?: HmiScreenPositionMode;
  sizeMode?: HmiScreenSizeMode;
  securityCode?: string;
  titleBarVisible?: boolean;
  titleBarText?: string;
  maximumTagUpdateRateSeconds?: number;
  initialInputFocusEnabled?: boolean;
  focusHighlightEnabled?: boolean;
  focusHighlightColor?: HmiColor;
  allowMultipleRunningCopies?: boolean;
  keepAtBack?: boolean;
  cannotBeReplaced?: boolean;
  cacheAfterDisplaying?: boolean;
  cacheMode?: HmiScreenCacheMode;
  systemMenuVisible?: boolean;
  minimizeButtonVisible?: boolean;
  pinButtonVisible?: boolean;
  sizeToMainWindow?: boolean;
  resizeMode?: HmiScreenResizeMode;
  showLastAcquiredValue?: boolean;
  trackForNavigation?: boolean;
  navigationHistoryName?: string;
  beepOnPress?: boolean;
  highlightWhenPointerPassesOver?: boolean;
  interactiveHighlightColor?: HmiColor;
  fieldNotSelectedTextColor?: HmiColor;
  fieldNotSelectedFillColor?: HmiColor;
  fieldSelectedTextColor?: HmiColor;
  fieldSelectedFillColor?: HmiColor;
  fieldInErrorNotSelectedTextColor?: HmiColor;
  fieldInErrorNotSelectedFillColor?: HmiColor;
  fieldInErrorSelectedTextColor?: HmiColor;
  fieldInErrorSelectedFillColor?: HmiColor;
  displayOnScreenKeyboard?: boolean;
  allowButtonActionOnError?: boolean;
  startupCommand?: string;
  shutdownCommand?: string;
}
