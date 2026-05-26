import { HmiModelBase } from "./HmiModelBase.js";
import { HmiScreenItemBase } from "./HmiScreenItemBase.js";

export class HmiLayer extends HmiModelBase {
  visible = true;
  locked = false;
  readonly items: HmiScreenItemBase[] = [];
}
