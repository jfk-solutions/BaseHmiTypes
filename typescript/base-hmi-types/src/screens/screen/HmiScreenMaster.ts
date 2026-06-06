import { HmiScreenBase } from "../base/HmiScreenBase.js";
import { HmiScreenKind } from "../base/HmiScreenKind.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiScreenMaster extends HmiScreenBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiScreenMaster;
    this.kind = HmiScreenKind.Template;
  }
}
