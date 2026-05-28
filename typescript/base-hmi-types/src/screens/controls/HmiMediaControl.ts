import { HmiProperty } from "../base.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";

export class HmiMediaControl extends HmiControlWindowBase {
  source?: HmiProperty<string>;
  autoPlay?: HmiProperty<boolean>;
}
