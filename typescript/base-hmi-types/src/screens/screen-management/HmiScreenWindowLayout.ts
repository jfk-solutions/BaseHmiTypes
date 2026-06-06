import { HmiScreenModelBase } from "../base/HmiScreenModelBase.js";
import { HmiTopLevelScreenWindow } from "../screen/HmiTopLevelScreenWindow.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiScreenWindowLayout extends HmiScreenModelBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiScreenWindowLayout;
  }

  readonly windows: HmiTopLevelScreenWindow[] = [];
}
