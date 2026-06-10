import { HmiColor, HmiProperty } from "../base.js";
import { HmiFillPattern } from "../base/HmiFillPattern.js";
import { HmiSimpleScreenItemBase } from "../base/HmiSimpleScreenItemBase.js";

export abstract class HmiShapeBase extends HmiSimpleScreenItemBase {
  lineColor?: HmiProperty<HmiColor>;
  alternateLineColor?: HmiProperty<HmiColor>;
  lineWidth?: HmiProperty<number>;
  dashType?: HmiProperty<number>;
  backFillPattern?: HmiProperty<number>;
  fillPattern?: HmiProperty<HmiFillPattern>;
  transparentColor?: HmiProperty<HmiColor>;
  useTransparentColor?: HmiProperty<boolean>;
  firstGradientColor?: HmiProperty<HmiColor>;
  firstGradientOffset?: HmiProperty<number>;
  middleGradientColor?: HmiProperty<HmiColor>;
  secondGradientColor?: HmiProperty<HmiColor>;
  secondGradientOffset?: HmiProperty<number>;
  useFirstGradient?: HmiProperty<boolean>;
  useSecondGradient?: HmiProperty<boolean>;
  useDesignColorSchema?: HmiProperty<boolean>;
  useDesignShadowSettings?: HmiProperty<boolean>;
}
