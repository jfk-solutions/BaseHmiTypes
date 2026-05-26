import { HmiScreenItemBase } from "./HmiScreenItemBase.js";

export abstract class HmiLayoutContainerBase extends HmiScreenItemBase {
  readonly items: HmiScreenItemBase[] = [];
}
