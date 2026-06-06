import { HmiModelBase } from "./HmiModelBase.js";
import { HmiObjectType } from "./HmiObjectType.js";

export abstract class HmiScreenModelBase extends HmiModelBase {
  hmiObjectType: HmiObjectType = HmiObjectType.Unknown;
}
