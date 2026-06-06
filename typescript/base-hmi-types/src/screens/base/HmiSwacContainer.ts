import { HmiContainerBase } from "./HmiContainerBase.js";
import { HmiObjectType } from "./HmiObjectType.js";

export class HmiSwacContainer extends HmiContainerBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiSwacContainer;
  }
}
