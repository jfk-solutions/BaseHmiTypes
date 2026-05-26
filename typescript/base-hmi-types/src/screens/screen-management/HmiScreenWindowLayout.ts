import { HmiScreenModelBase } from "../base/HmiScreenModelBase.js";
import { HmiTopLevelScreenWindow } from "../screen/HmiTopLevelScreenWindow.js";

export class HmiScreenWindowLayout extends HmiScreenModelBase {
  readonly windows: HmiTopLevelScreenWindow[] = [];
}
