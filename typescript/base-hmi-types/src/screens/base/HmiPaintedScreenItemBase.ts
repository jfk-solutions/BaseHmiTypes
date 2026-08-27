import { HmiProperty } from "./HmiProperty.js";
import { HmiColor } from "./HmiColor.js";
import { HmiScreenItemBase } from "./HmiScreenItemBase.js";
import { HmiThickness } from "./HmiThickness.js";
import { HmiFillAnimation } from "./HmiFillAnimation.js";
import { HmiColorAnimation } from "./HmiColorAnimation.js";

export abstract class HmiPaintedScreenItemBase extends HmiScreenItemBase {
  foregroundColor?: HmiProperty<HmiColor>;
  alternateForegroundColor?: HmiProperty<HmiColor>;
  backgroundColor?: HmiProperty<HmiColor>;
  alternateBackgroundColor?: HmiProperty<HmiColor>;
  borderColor?: HmiProperty<HmiColor>;
  borderBackgroundColor?: HmiProperty<HmiColor>;
  borderUsesBackgroundColor?: HmiProperty<boolean>;
  alternateBorderColor?: HmiProperty<HmiColor>;
  borderWidth?: HmiProperty<number>;
  borderStyle?: HmiProperty<number>;
  focusHighlight?: HmiProperty<boolean>;
  pointerHighlight?: HmiProperty<boolean>;
  backgroundBlink?: HmiProperty<boolean>;
  fillAnimation?: HmiFillAnimation;
  colorAnimation?: HmiColorAnimation;
  margin?: HmiThickness;
  padding?: HmiThickness | HmiProperty<number>;
}
