import { HmiColor } from "./HmiColor.js";
import { HmiFont } from "./HmiFont.js";
import { HmiProperty } from "./HmiProperty.js";
import { HmiWindowBase } from "./HmiWindowBase.js";

export abstract class HmiControlWindowBase extends HmiWindowBase {
  headerBackgroundColor?: HmiProperty<HmiColor>;
  headerForegroundColor?: HmiProperty<HmiColor>;
  contentBackgroundColor?: HmiProperty<HmiColor>;
  contentForegroundColor?: HmiProperty<HmiColor>;
  headerFont?: HmiFont;
  contentFont?: HmiFont;
}
