import { HmiImageSource, HmiProperty } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";

export class HmiButton extends HmiWidgetBase {
  text?: HmiProperty<string>;
  alternateText?: HmiProperty<string>;
  image?: HmiProperty<HmiImageSource>;
  alternateImage?: HmiProperty<HmiImageSource>;
  graphicStretchMode?: HmiProperty<number>;
  hotKey?: HmiProperty<string>;
  pressedStateTags?: HmiProperty<string>;
  mode?: HmiProperty<number>;
  windowsStyle?: HmiProperty<boolean>;
}
