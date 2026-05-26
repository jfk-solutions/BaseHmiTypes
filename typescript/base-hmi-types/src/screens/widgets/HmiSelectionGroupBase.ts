import { HmiWidgetBase } from "./HmiWidgetBase.js";

export abstract class HmiSelectionGroupBase extends HmiWidgetBase {
  readonly items: string[] = [];
}
