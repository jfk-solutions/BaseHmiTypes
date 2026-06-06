import { HmiScreenBase } from "../base/HmiScreenBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiScreen extends HmiScreenBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiScreen;
  }
}
