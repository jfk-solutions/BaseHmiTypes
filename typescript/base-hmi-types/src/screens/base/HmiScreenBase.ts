import { HmiLayer } from "./HmiLayer.js";
import { HmiProperty, staticProperty } from "./HmiProperty.js";
import { HmiCursorMode } from "./HmiCursorMode.js";
import { HmiScreenModelBase } from "./HmiScreenModelBase.js";
import { HmiScreenKind } from "./HmiScreenKind.js";
import { HmiUpdateCycle } from "./HmiUpdateCycle.js";

export abstract class HmiScreenBase extends HmiScreenModelBase {
  kind: HmiScreenKind = HmiScreenKind.Screen;
  number?: number;
  width: HmiProperty<number> = staticProperty(0);
  height: HmiProperty<number> = staticProperty(0);
  cursorMode?: HmiProperty<HmiCursorMode>;
  updateCycle?: HmiProperty<HmiUpdateCycle>;
  readonly layers: HmiLayer[] = [];
}
