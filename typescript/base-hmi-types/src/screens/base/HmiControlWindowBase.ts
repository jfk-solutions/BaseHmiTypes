import { HmiColor } from "./HmiColor.js";
import { HmiFont } from "./HmiFont.js";
import { HmiHorizontalAlignment } from "./HmiHorizontalAlignment.js";
import { HmiProperty } from "./HmiProperty.js";
import { HmiVerticalAlignment } from "./HmiVerticalAlignment.js";
import { HmiWindowBase } from "./HmiWindowBase.js";

export abstract class HmiControlWindowBase extends HmiWindowBase {
  headerBackgroundColor?: HmiProperty<HmiColor>;
  headerForegroundColor?: HmiProperty<HmiColor>;
  contentBackgroundColor?: HmiProperty<HmiColor>;
  contentForegroundColor?: HmiProperty<HmiColor>;
  contentHorizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  contentVerticalAlignment?: HmiProperty<HmiVerticalAlignment>;
  headerFont?: HmiFont;
  contentFont?: HmiFont;
}
