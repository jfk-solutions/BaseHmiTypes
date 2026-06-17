import { HmiContainerBase } from "./HmiContainerBase.js";
import { HmiObjectType } from "./HmiObjectType.js";
import { HmiFaceplateInterfaceValue } from "./HmiFaceplateInterfaceValue.js";

export class HmiFaceplateContainer extends HmiContainerBase {
  faceplateId?: string;
  faceplateName?: string;
  faceplateVersion?: string;
  readonly interfaceValues: HmiFaceplateInterfaceValue[] = [];

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiFaceplateContainer;
  }
}
