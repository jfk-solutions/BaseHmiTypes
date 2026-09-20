import { HmiProperty } from "../base/HmiProperty.js";
import { HmiWindowBase } from "../base/HmiWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiScreenWindow extends HmiWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiScreenWindow;
  }

  screenId?: HmiProperty<string>;
  screenName?: HmiProperty<string>;
  tabIntoWindow?: HmiProperty<boolean>;
  startupPosition?: HmiProperty<number>;
  windowState?: HmiProperty<number>;
  isModal?: HmiProperty<boolean>;
  offsetLeft?: HmiProperty<number>;
  offsetTop?: HmiProperty<number>;
  fitScreenToWindow?: HmiProperty<boolean>;
  fitWindowToScreen?: HmiProperty<boolean>;
  showScrollBars?: HmiProperty<boolean>;
  zoomPercent?: HmiProperty<number>;
  scrollPositionLeft?: HmiProperty<number>;
  scrollPositionTop?: HmiProperty<number>;
}
