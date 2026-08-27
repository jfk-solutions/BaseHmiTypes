import { HmiProperty } from "../base.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiWebControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiWebControl;
  }

  url?: HmiProperty<string>;
  homeUrl?: HmiProperty<string>;
  showAddressBar?: HmiProperty<boolean>;
  useParameterPlaceholders?: HmiProperty<boolean>;
  navigateBack?: HmiProperty<boolean>;
  navigateForward?: HmiProperty<boolean>;
  stop?: HmiProperty<boolean>;
  refresh?: HmiProperty<boolean>;
}
