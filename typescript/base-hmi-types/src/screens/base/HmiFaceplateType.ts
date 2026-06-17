import { HmiScreenBase } from "./HmiScreenBase.js";
import { HmiObjectType } from "./HmiObjectType.js";
import { HmiScreenKind } from "./HmiScreenKind.js";
import { HmiFaceplateInterfaceMember } from "./HmiFaceplateInterfaceMember.js";

export class HmiFaceplateType extends HmiScreenBase {
  version?: string;
  readonly interfaceProperties: HmiFaceplateInterfaceMember[] = [];
  readonly tagInterfaceProperties: HmiFaceplateInterfaceMember[] = [];

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiFaceplateType;
    this.kind = HmiScreenKind.Faceplate;
  }
}
