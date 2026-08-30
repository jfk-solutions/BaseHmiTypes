import { HmiReferenceAnimationMode } from "./HmiReferenceAnimationMode.js";
import { HmiReferenceParameter } from "./HmiReferenceParameter.js";
import type { HmiScreenItemBase } from "./HmiScreenItemBase.js";

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
  /** Resolved source definition; this is not a materialized reference instance. */
  resolvedObject?: HmiScreenItemBase;
  /** Reference-specific object after parameter substitution; the shared source stays unchanged. */
  materializedObject?: HmiScreenItemBase;
  animationMode?: HmiReferenceAnimationMode;
  connectionsLinked?: boolean;
  sizeLinked?: boolean;
  toolTipLinked?: boolean;
  readonly parameters: HmiReferenceParameter[] = [];
}
