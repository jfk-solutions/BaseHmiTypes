import { HmiContainerBase } from "./HmiContainerBase.js";
import { HmiObjectType } from "./HmiObjectType.js";

export class HmiCustomWebControlContainer extends HmiContainerBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiCustomWebControlContainer;
  }
}
