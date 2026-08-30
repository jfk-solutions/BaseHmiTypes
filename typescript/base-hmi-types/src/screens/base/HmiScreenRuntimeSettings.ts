import { HmiColor } from "./HmiColor.js";
import { HmiScreenCacheMode } from "./HmiScreenCacheMode.js";
import type { HmiMultilingualText } from "../../common/HmiMultilingualText.js";

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
  positionX?: number;
  positionY?: number;
  sizeMode?: HmiScreenSizeMode;
  securityCode?: string;
  titleBarVisible?: boolean;
  titleBarText?: string;
  /** Structured, potentially multilingual title; titleBarText can retain a renderer-friendly preview. */
  title?: HmiMultilingualText;
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
