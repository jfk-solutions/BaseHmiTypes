import { HmiLayoutContainerBase } from "./HmiLayoutContainerBase.js";
import { HmiObjectType } from "./HmiObjectType.js";

export class HmiGroup extends HmiLayoutContainerBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiGroup;
  }

  isLogicGrouping = false;
}
