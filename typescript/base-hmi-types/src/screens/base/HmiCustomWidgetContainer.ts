import { HmiLayoutContainerBase } from "./HmiLayoutContainerBase.js";
import { HmiObjectType } from "./HmiObjectType.js";

export class HmiCustomWidgetContainer extends HmiLayoutContainerBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiCustomWidgetContainer;
  }
}
