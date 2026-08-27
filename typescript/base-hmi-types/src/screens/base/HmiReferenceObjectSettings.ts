import { HmiReferenceAnimationMode } from "./HmiReferenceAnimationMode.js";

export class HmiReferenceObjectSettings {
  source?: string;
  animationMode?: HmiReferenceAnimationMode;
  connectionsLinked?: boolean;
  sizeLinked?: boolean;
  toolTipLinked?: boolean;
}
