import { HmiScreenModelBase } from "./HmiScreenModelBase.js";

export abstract class HmiScreenItemBase extends HmiScreenModelBase {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  visible = true;
}
