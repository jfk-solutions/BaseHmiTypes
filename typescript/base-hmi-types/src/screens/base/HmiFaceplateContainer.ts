import { HmiContainerBase } from "./HmiContainerBase.js";
import { HmiObjectType } from "./HmiObjectType.js";

export class HmiFaceplateContainer extends HmiContainerBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiFaceplateContainer;
  }
}
