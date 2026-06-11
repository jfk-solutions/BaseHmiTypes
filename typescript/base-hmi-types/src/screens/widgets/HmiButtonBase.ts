import { HmiColor, HmiImageSource, HmiProperty } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";

export abstract class HmiButtonBase extends HmiWidgetBase {
  text?: HmiProperty<string>;
  alternateText?: HmiProperty<string>;
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
