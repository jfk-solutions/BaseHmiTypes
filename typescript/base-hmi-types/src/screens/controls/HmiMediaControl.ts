import { HmiProperty, HmiColor } from "../base.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiMediaControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiMediaControl;
  }

  source?: HmiProperty<string>;
  autoPlay?: HmiProperty<boolean>;
  videoOutput?: HmiProperty<number>;
  showToolbar?: HmiProperty<boolean>;
  toolbarBackgroundColor?: HmiProperty<HmiColor>;
  toolbarForegroundColor?: HmiProperty<HmiColor>;
  showStatusBar?: HmiProperty<boolean>;
  statusBarBackgroundColor?: HmiProperty<HmiColor>;
  statusBarForegroundColor?: HmiProperty<HmiColor>;
}
