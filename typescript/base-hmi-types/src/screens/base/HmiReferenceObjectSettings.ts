import { HmiReferenceAnimationMode } from "./HmiReferenceAnimationMode.js";
import { HmiReferenceParameter } from "./HmiReferenceParameter.js";

export class HmiReferenceObjectSettings {
  source?: string;
  animationMode?: HmiReferenceAnimationMode;
  connectionsLinked?: boolean;
  sizeLinked?: boolean;
  toolTipLinked?: boolean;
  readonly parameters: HmiReferenceParameter[] = [];
}
