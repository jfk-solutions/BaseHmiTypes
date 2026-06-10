import { HmiColor, HmiFont, HmiHorizontalAlignment, HmiProperty, HmiVerticalAlignment } from "../base.js";
import { HmiFillPattern } from "../base/HmiFillPattern.js";
import { HmiSimpleScreenItemBase } from "../base/HmiSimpleScreenItemBase.js";

export abstract class HmiWidgetBase extends HmiSimpleScreenItemBase {
  font?: HmiFont;
  horizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  verticalAlignment?: HmiProperty<HmiVerticalAlignment>;
  focusColor?: HmiProperty<HmiColor>;
  focusWidth?: HmiProperty<number>;
  backFillPattern?: HmiProperty<number>;
  fillPattern?: HmiProperty<HmiFillPattern>;
  cornerRadius?: HmiProperty<number>;
  cornerStyle?: HmiProperty<number>;
  edgeStyle?: HmiProperty<number>;
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
