import { HmiScreenModelBase } from "./base.js";
import { HmiTopLevelScreenWindow } from "./screens.js";

export class HmiScreenWindowLayout extends HmiScreenModelBase {
  readonly windows: HmiTopLevelScreenWindow[] = [];
}
