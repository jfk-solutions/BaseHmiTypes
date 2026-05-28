import { HmiProperty } from "../base.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";

export class HmiWebControl extends HmiControlWindowBase {
  url?: HmiProperty<string>;
  homeUrl?: HmiProperty<string>;
}
