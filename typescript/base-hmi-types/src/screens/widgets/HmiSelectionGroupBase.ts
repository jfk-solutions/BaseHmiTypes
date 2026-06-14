import { HmiColor, HmiImageSource, HmiProperty } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";

export interface HmiSelectionGroupItem {
  text?: string;
  image?: HmiImageSource;
  imageName?: string;
}

export abstract class HmiSelectionGroupBase extends HmiWidgetBase {
  readonly items: HmiSelectionGroupItem[] = [];
  selectedIndex?: HmiProperty<number>;
  selectionMode?: HmiProperty<number>;
  selectionItemHeight?: HmiProperty<number>;
  selectionBackgroundColor?: HmiProperty<HmiColor>;
  selectionForegroundColor?: HmiProperty<HmiColor>;
  evenRowBackgroundColor?: HmiProperty<HmiColor>;
  selectionBorderColor?: HmiProperty<HmiColor>;
  selectionBorderWidth?: HmiProperty<number>;
}
