import { HmiProperty } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";

export abstract class HmiSelectionGroupBase extends HmiWidgetBase {
  readonly items: string[] = [];
  selectedIndex?: HmiProperty<number>;
  selectionMode?: HmiProperty<number>;
  selectionItemHeight?: HmiProperty<number>;
}
