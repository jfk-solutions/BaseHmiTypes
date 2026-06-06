import { HmiWindowBase } from "./HmiWindowBase.js";
import { HmiObjectType } from "./HmiObjectType.js";

export class HmiDcsFaceplateContainer extends HmiWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiDcsFaceplateContainer;
  }
}
