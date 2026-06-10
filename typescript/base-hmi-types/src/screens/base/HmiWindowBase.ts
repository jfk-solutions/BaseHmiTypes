import { HmiColor } from "./HmiColor.js";
import { HmiFillPattern } from "./HmiFillPattern.js";
import { HmiPaintedScreenItemBase } from "./HmiPaintedScreenItemBase.js";
import { HmiProperty } from "./HmiProperty.js";

export abstract class HmiWindowBase extends HmiPaintedScreenItemBase {
  captionColor?: HmiProperty<HmiColor>;
  captionBackgroundColor?: HmiProperty<HmiColor>;
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
