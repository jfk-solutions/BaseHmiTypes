import { HmiModelBase } from "./HmiModelBase.js";
import { HmiObjectType } from "./HmiObjectType.js";
import type { HmiUnifiedEngineeringObject } from './HmiUnifiedEngineeringObject.js';

export abstract class HmiScreenModelBase extends HmiModelBase {
  unifiedEngineering?: HmiUnifiedEngineeringObject;
  hmiObjectType: HmiObjectType = HmiObjectType.Unknown;
}
