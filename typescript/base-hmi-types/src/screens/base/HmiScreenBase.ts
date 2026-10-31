import { HmiHorizontalAlignment } from "./HmiHorizontalAlignment.js";
import { HmiVerticalAlignment } from "./HmiVerticalAlignment.js";
import { HmiLayer } from "./HmiLayer.js";
import { HmiProperty, staticProperty } from "./HmiProperty.js";
import { HmiCursorMode } from "./HmiCursorMode.js";
import { HmiColor } from "./HmiColor.js";
import { HmiGradientDirection } from "./HmiGradientDirection.js";
import { HmiFillPattern } from "./HmiFillPattern.js";
import { HmiFillPatternAlignment } from "./HmiFillPatternAlignment.js";
import { HmiScreenModelBase } from "./HmiScreenModelBase.js";
import { HmiScreenKind } from "./HmiScreenKind.js";
import { HmiUpdateCycle } from "./HmiUpdateCycle.js";
import { HmiScreenParameter } from "./HmiScreenParameter.js";
import { HmiScreenRuntimeSettings } from "./HmiScreenRuntimeSettings.js";
import { HmiImageSource } from "./HmiImageSource.js";
import { HmiBackgroundImageLayout } from "./HmiBackgroundImageLayout.js";
import { HmiEventBinding } from "../../scripts/HmiEventBinding.js";
import { HmiDeviceKeyBinding } from './HmiDeviceKeyBinding.js';
import type { HmiMultilingualText } from "../../common/HmiMultilingualText.js";

export abstract class HmiScreenBase extends HmiScreenModelBase {
  /** Configured edge for a native slide-in resource; absent on ordinary screens. */
  slideInEdge?: HmiSlideInEdge;
  kind: HmiScreenKind = HmiScreenKind.Screen;
  /** Producer API provenance, when known; never selects the XML contract. */
  engineeringApiVersion?: string;
  sourceFormat?: string;
  sourceData?: Uint8Array;
  readonly sourceProperties: Record<string, string> = {};
  number?: number;
  toolTipText?: HmiProperty<HmiMultilingualText>;
  width: HmiProperty<number> = staticProperty(0);
  height: HmiProperty<number> = staticProperty(0);
  backgroundColor?: HmiProperty<HmiColor>;
  backgroundImage?: HmiImageSource;
  backgroundImageLayout?: HmiProperty<HmiBackgroundImageLayout>;
  patternColor?: HmiProperty<HmiColor>;
  fillPattern?: HmiProperty<HmiFillPattern>;
  fillPatternAlignment?: HmiProperty<HmiFillPatternAlignment>;
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
  /** Screen-level lifecycle and operator event actions. */
  readonly events: HmiEventBinding[] = [];
  /** Local keys override template keys with the same native input identity. */
  readonly deviceKeys: HmiDeviceKeyBinding[] = [];
  enabled?: HmiProperty<boolean>;
  alternateBackgroundColor?: HmiProperty<HmiColor>;
  horizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  verticalAlignment?: HmiProperty<HmiVerticalAlignment>;
  backgroundFillMode?: HmiProperty<string>;
  graphicStretchMode?: HmiProperty<number>;
}

export enum HmiSlideInEdge { Top = "Top", Left = "Left", Bottom = "Bottom", Right = "Right" }
