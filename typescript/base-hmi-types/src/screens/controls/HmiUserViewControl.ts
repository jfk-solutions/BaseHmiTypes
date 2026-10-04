import { HmiColor, HmiFont, HmiProperty } from "../base.js";
import { HmiLayoutContainerBase } from "../base/HmiLayoutContainerBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiUserViewControl extends HmiLayoutContainerBase {
  constructor() { super(); this.hmiObjectType = HmiObjectType.HmiUserViewControl; }

  headerBackgroundColor?: HmiProperty<HmiColor>;
  headerForegroundColor?: HmiProperty<HmiColor>;
  headerBorderWidth?: HmiProperty<number>;
  headerBorderColor?: HmiProperty<HmiColor>;
  contentBackgroundColor?: HmiProperty<HmiColor>;
  contentForegroundColor?: HmiProperty<HmiColor>;
  headerFont?: HmiFont;
  contentFont?: HmiFont;

  showGridLines?: HmiProperty<boolean>;
  gridLineColor?: HmiProperty<HmiColor>;
  alternatingRowBackgroundColor?: HmiProperty<HmiColor>;
  selectionBackgroundColor?: HmiProperty<HmiColor>;
  selectionForegroundColor?: HmiProperty<HmiColor>;
}
