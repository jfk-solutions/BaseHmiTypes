import { HmiScreenBase } from "../base/HmiScreenBase.js";
import { HmiScreenKind } from "../base/HmiScreenKind.js";

export class HmiScreenMaster extends HmiScreenBase {
  constructor() {
    super();
    this.kind = HmiScreenKind.Template;
  }
}
