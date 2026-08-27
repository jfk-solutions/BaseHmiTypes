import { HmiLayer } from "./HmiLayer.js";
import { HmiProperty, staticProperty } from "./HmiProperty.js";
import { HmiCursorMode } from "./HmiCursorMode.js";
import { HmiColor } from "./HmiColor.js";
import { HmiGradientDirection } from "./HmiGradientDirection.js";
import { HmiScreenModelBase } from "./HmiScreenModelBase.js";
import { HmiScreenKind } from "./HmiScreenKind.js";
import { HmiUpdateCycle } from "./HmiUpdateCycle.js";
import { HmiScreenParameter } from "./HmiScreenParameter.js";
import { HmiScreenRuntimeSettings } from "./HmiScreenRuntimeSettings.js";

export abstract class HmiScreenBase extends HmiScreenModelBase {
  kind: HmiScreenKind = HmiScreenKind.Screen;
  number?: number;
  width: HmiProperty<number> = staticProperty(0);
  height: HmiProperty<number> = staticProperty(0);
  backgroundColor?: HmiProperty<HmiColor>;
  firstGradientColor?: HmiProperty<HmiColor>;
  firstGradientOffset?: HmiProperty<number>;
  middleGradientColor?: HmiProperty<HmiColor>;
  secondGradientColor?: HmiProperty<HmiColor>;
  secondGradientOffset?: HmiProperty<number>;
  useFirstGradient?: HmiProperty<boolean>;
  useSecondGradient?: HmiProperty<boolean>;
  gradientDirection?: HmiProperty<HmiGradientDirection>;
  rasterColor?: HmiProperty<HmiColor>;
  templateId?: HmiProperty<string>;
  templateName?: HmiProperty<string>;
  cursorMode?: HmiProperty<HmiCursorMode>;
  updateCycle?: HmiProperty<HmiUpdateCycle>;
  runtimeSettings?: HmiScreenRuntimeSettings;
  readonly parameters: HmiScreenParameter[] = [];
  readonly layers: HmiLayer[] = [];
}
