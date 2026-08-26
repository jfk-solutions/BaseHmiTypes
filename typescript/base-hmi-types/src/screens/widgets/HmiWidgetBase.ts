import { HmiColor, HmiFont, HmiHorizontalAlignment, HmiLineStyle, HmiProperty, HmiVerticalAlignment } from "../base.js";
import { HmiFillPattern } from "../base/HmiFillPattern.js";
import { HmiGradientDirection } from "../base/HmiGradientDirection.js";
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
  edgeStyle?: HmiProperty<HmiLineStyle>;
  firstGradientColor?: HmiProperty<HmiColor>;
  firstGradientOffset?: HmiProperty<number>;
  middleGradientColor?: HmiProperty<HmiColor>;
  secondGradientColor?: HmiProperty<HmiColor>;
  secondGradientOffset?: HmiProperty<number>;
  useFirstGradient?: HmiProperty<boolean>;
  useSecondGradient?: HmiProperty<boolean>;
  gradientDirection?: HmiProperty<HmiGradientDirection>;
  useDesignColorSchema?: HmiProperty<boolean>;
  useDesignShadowSettings?: HmiProperty<boolean>;
}
