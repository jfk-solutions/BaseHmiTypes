import { HmiProperty } from "../base/HmiProperty.js";
import { HmiWindowBase } from "../base/HmiWindowBase.js";

export class HmiScreenWindow extends HmiWindowBase {
  screenId?: HmiProperty<string>;
  screenName?: HmiProperty<string>;
  tabIntoWindow?: HmiProperty<boolean>;
  startupPosition?: HmiProperty<number>;
  windowState?: HmiProperty<number>;
  isModal?: HmiProperty<boolean>;
  offsetLeft?: HmiProperty<number>;
  offsetTop?: HmiProperty<number>;
}
