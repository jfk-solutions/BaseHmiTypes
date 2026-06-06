import { HmiContainerBase } from "./HmiContainerBase.js";
import { HmiObjectType } from "./HmiObjectType.js";

export class HmiDotNetControlContainer extends HmiContainerBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiDotNetControlContainer;
  }
}
