import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiColor, HmiImageSource } from "../base.js";

export class HmiState {
  name?: string;
  value?: number;
  text?: HmiMultilingualText;
  imageName?: string;
  image?: HmiImageSource;
  foregroundColor?: HmiColor;
  backgroundColor?: HmiColor;
  borderColor?: HmiColor;
  blink = false;
}
