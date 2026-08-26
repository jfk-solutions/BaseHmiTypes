import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiColor, HmiImageSource, HmiProperty } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";
import { HmiState } from "./HmiState.js";

export abstract class HmiButtonBase extends HmiWidgetBase {
  readonly states: HmiState[] = [];
  state?: HmiProperty<number>;
  text?: HmiProperty<HmiMultilingualText>;
  alternateText?: HmiProperty<HmiMultilingualText>;
  image?: HmiProperty<HmiImageSource>;
  alternateImage?: HmiProperty<HmiImageSource>;
  graphicStretchMode?: HmiProperty<number>;
  hotKey?: HmiProperty<string>;
  pressedStateTags?: HmiProperty<string>;
  styleSettings?: HmiProperty<number>;
  windowsStyle?: HmiProperty<boolean>;
  captionColor?: HmiProperty<HmiColor>;
  captionBackgroundColor?: HmiProperty<HmiColor>;
}
