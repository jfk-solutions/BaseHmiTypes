import { HmiScreenItemBase } from "./HmiScreenItemBase.js";
import { HmiWindowBase } from "./HmiWindowBase.js";

export abstract class HmiContainerBase extends HmiWindowBase {
  readonly items: HmiScreenItemBase[] = [];
}
