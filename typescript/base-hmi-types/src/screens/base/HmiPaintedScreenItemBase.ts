import { HmiProperty } from "./HmiProperty.js";
import { HmiColor } from "./HmiColor.js";
import { HmiScreenItemBase } from "./HmiScreenItemBase.js";
import { HmiThickness } from "./HmiThickness.js";

export abstract class HmiPaintedScreenItemBase extends HmiScreenItemBase {
  foregroundColor?: HmiProperty<HmiColor>;
  alternateForegroundColor?: HmiProperty<HmiColor>;
  backgroundColor?: HmiProperty<HmiColor>;
  alternateBackgroundColor?: HmiProperty<HmiColor>;
  borderColor?: HmiProperty<HmiColor>;
  borderBackgroundColor?: HmiProperty<HmiColor>;
  alternateBorderColor?: HmiProperty<HmiColor>;
  borderWidth?: HmiProperty<number>;
  borderStyle?: HmiProperty<number>;
  focusHighlight?: HmiProperty<boolean>;
  pointerHighlight?: HmiProperty<boolean>;
  backgroundBlink?: HmiProperty<boolean>;
  margin?: HmiThickness;
  padding?: HmiThickness | HmiProperty<number>;
}
