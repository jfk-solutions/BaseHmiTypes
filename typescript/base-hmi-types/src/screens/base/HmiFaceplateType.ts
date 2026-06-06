import { HmiScreenBase } from "./HmiScreenBase.js";
import { HmiObjectType } from "./HmiObjectType.js";

export class HmiFaceplateType extends HmiScreenBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiFaceplateType;
  }
}
