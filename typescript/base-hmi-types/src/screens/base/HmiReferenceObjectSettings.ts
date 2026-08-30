import { HmiReferenceAnimationMode } from "./HmiReferenceAnimationMode.js";
import { HmiReferenceParameter } from "./HmiReferenceParameter.js";

export class HmiReferenceObjectSettings {
  source?: string;
  /** Whether the source display and base object were resolved. */
  isResolved?: boolean;
  /** Project item ID of the resolved global-object display. */
  resolvedSourceId?: string;
  /** Parser-neutral ID of the resolved base object, when present. */
  resolvedObjectId?: string;
  /** Name of the resolved base object. */
  resolvedObjectName?: string;
  animationMode?: HmiReferenceAnimationMode;
  connectionsLinked?: boolean;
  sizeLinked?: boolean;
  toolTipLinked?: boolean;
  readonly parameters: HmiReferenceParameter[] = [];
}
