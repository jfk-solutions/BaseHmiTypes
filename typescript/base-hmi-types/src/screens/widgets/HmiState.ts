import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiColor, HmiImageSource } from "../base.js";

export class HmiState {
  name?: string;
  value?: number;
  text?: HmiMultilingualText;
  imageName?: string;
  image?: HmiImageSource;
  imageScaled?: boolean;
  imageColor?: HmiColor;
  imageBackgroundColor?: HmiColor;
  imageBackgroundTransparent?: boolean;
  captionColor?: HmiColor;
  captionBackgroundColor?: HmiColor;
  foregroundColor?: HmiColor;
  backgroundColor?: HmiColor;
  borderColor?: HmiColor;
  blink = false;
  captionBlink = false;
  captionBackgroundTransparent?: boolean;
  imageBlink = false;
}
