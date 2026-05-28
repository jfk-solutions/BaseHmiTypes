import { HmiProperty } from "../base/HmiProperty.js";
import { HmiWindowBase } from "../base/HmiWindowBase.js";

export class HmiScreenWindow extends HmiWindowBase {
  screenId?: string;
  screenName?: string;
  tabIntoWindow?: HmiProperty<boolean>;
  startupPosition?: HmiProperty<number>;
  windowState?: HmiProperty<number>;
  isModal?: HmiProperty<boolean>;
  offsetLeft?: HmiProperty<number>;
  offsetTop?: HmiProperty<number>;
}
