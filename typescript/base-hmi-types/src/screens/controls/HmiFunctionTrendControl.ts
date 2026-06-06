import { HmiTrendControlBase } from "../base/HmiTrendControlBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiFunctionTrendControl extends HmiTrendControlBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiFunctionTrendControl;
  }
}
