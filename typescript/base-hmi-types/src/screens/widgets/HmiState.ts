import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiColor, HmiFillPattern, HmiHorizontalAlignment, HmiImageSource, HmiVerticalAlignment } from "../base.js";
import { HmiDisplayParameterSource } from "./HmiDisplayParameterSource.js";

export class HmiState {
  name?: string;
  value?: number;
  text?: HmiMultilingualText;
  targetDisplay?: string;
  parameterFile?: string;
  parameterList?: string;
  parameterSource?: HmiDisplayParameterSource;
  captionUsesDisplayName?: boolean;
  imageName?: string;
  image?: HmiImageSource;
  imageScaled?: boolean;
  imageColor?: HmiColor;
  imageBackgroundColor?: HmiColor;
  imageBackgroundTransparent?: boolean;
  imageHorizontalAlignment?: HmiHorizontalAlignment;
  imageVerticalAlignment?: HmiVerticalAlignment;
  captionColor?: HmiColor;
  captionBackgroundColor?: HmiColor;
  captionHorizontalAlignment?: HmiHorizontalAlignment;
  captionVerticalAlignment?: HmiVerticalAlignment;
  captionWordWrap?: boolean;
  foregroundColor?: HmiColor;
  backgroundColor?: HmiColor;
  fillPattern?: HmiFillPattern;
  patternColor?: HmiColor;
  borderColor?: HmiColor;
  blink = false;
  captionBlink = false;
  captionBackgroundTransparent?: boolean;
  imageBlink = false;
}
