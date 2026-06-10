import { HmiPaintedScreenItemBase } from "./HmiPaintedScreenItemBase.js";
import { HmiScreenItemBase } from "./HmiScreenItemBase.js";

export abstract class HmiLayoutContainerBase extends HmiPaintedScreenItemBase {
  readonly items: HmiScreenItemBase[] = [];
}
