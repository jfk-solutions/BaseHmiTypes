import { HmiColor, HmiImageSource, HmiProperty } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiButton extends HmiWidgetBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiButton;
  }

  text?: HmiProperty<string>;
  alternateText?: HmiProperty<string>;
  image?: HmiProperty<HmiImageSource>;
  alternateImage?: HmiProperty<HmiImageSource>;
  graphicStretchMode?: HmiProperty<number>;
  hotKey?: HmiProperty<string>;
  pressedStateTags?: HmiProperty<string>;
  mode?: HmiProperty<number>;
  styleSettings?: HmiProperty<number>;
  windowsStyle?: HmiProperty<boolean>;
  captionColor?: HmiProperty<HmiColor>;
  captionBackgroundColor?: HmiProperty<HmiColor>;
}
