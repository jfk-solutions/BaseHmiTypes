import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiColor, HmiHorizontalAlignment, HmiImageSource, HmiProperty, HmiThickness, HmiVerticalAlignment } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";
import { HmiButtonAction } from "./HmiButtonAction.js";
import { HmiButtonNextStateMode } from "./HmiButtonNextStateMode.js";
import { HmiState } from "./HmiState.js";

export abstract class HmiButtonBase extends HmiWidgetBase {
  readonly states: HmiState[] = [];
  configuredStateCount?: HmiProperty<number>;
  state?: HmiProperty<number>;
  text?: HmiProperty<HmiMultilingualText>;
  alternateText?: HmiProperty<HmiMultilingualText>;
  image?: HmiProperty<HmiImageSource>;
  alternateImage?: HmiProperty<HmiImageSource>;
  imageScaled?: HmiProperty<boolean>;
  imageBlink?: HmiProperty<boolean>;
  imageColor?: HmiProperty<HmiColor>;
  imageBackgroundColor?: HmiProperty<HmiColor>;
  imageBackgroundTransparent?: HmiProperty<boolean>;
  imageHorizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  imageVerticalAlignment?: HmiProperty<HmiVerticalAlignment>;
  graphicStretchMode?: HmiProperty<number>;
  hotKey?: HmiProperty<string>;
  pressedStateTags?: HmiProperty<string>;
  styleSettings?: HmiProperty<number>;
  windowsStyle?: HmiProperty<boolean>;
  touchEnabled?: HmiProperty<boolean>;
  audioEnabled?: HmiProperty<boolean>;
  autoRepeatDelaySeconds?: HmiProperty<number>;
  autoRepeatRatePerSecond?: HmiProperty<number>;
  holdTimeSeconds?: HmiProperty<number>;
  buttonAction?: HmiProperty<HmiButtonAction>;
  buttonValue?: HmiProperty<number>;
  nextStateMode?: HmiProperty<HmiButtonNextStateMode>;
  captionColor?: HmiProperty<HmiColor>;
  captionBackgroundColor?: HmiProperty<HmiColor>;
  touchMargin?: HmiThickness;
}
