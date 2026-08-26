import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiColor, HmiImageSource, HmiProperty, HmiThickness } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";
import { HmiButtonAction } from "./HmiButtonAction.js";
import { HmiState } from "./HmiState.js";

export abstract class HmiButtonBase extends HmiWidgetBase {
  readonly states: HmiState[] = [];
  state?: HmiProperty<number>;
  text?: HmiProperty<HmiMultilingualText>;
  alternateText?: HmiProperty<HmiMultilingualText>;
  image?: HmiProperty<HmiImageSource>;
  alternateImage?: HmiProperty<HmiImageSource>;
  imageScaled?: HmiProperty<boolean>;
  imageBlink?: HmiProperty<boolean>;
  graphicStretchMode?: HmiProperty<number>;
  hotKey?: HmiProperty<string>;
  pressedStateTags?: HmiProperty<string>;
  styleSettings?: HmiProperty<number>;
  windowsStyle?: HmiProperty<boolean>;
  touchEnabled?: HmiProperty<boolean>;
  autoRepeatDelaySeconds?: HmiProperty<number>;
  autoRepeatRatePerSecond?: HmiProperty<number>;
  holdTimeSeconds?: HmiProperty<number>;
  buttonAction?: HmiProperty<HmiButtonAction>;
  buttonValue?: HmiProperty<number>;
  captionColor?: HmiProperty<HmiColor>;
  captionBackgroundColor?: HmiProperty<HmiColor>;
  touchMargin?: HmiThickness;
}
