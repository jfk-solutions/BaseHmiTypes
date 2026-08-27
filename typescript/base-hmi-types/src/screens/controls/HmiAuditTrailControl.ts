import { HmiProperty } from "../base.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiAuditTrailFieldPresentation } from "./HmiAuditTrailFieldPresentation.js";
import { HmiAuditTrailViewKind } from "./HmiAuditTrailViewKind.js";

export class HmiAuditTrailControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiAuditTrailControl;
  }

  viewKind = HmiAuditTrailViewKind.List;
  showHeader?: HmiProperty<boolean>;
  linesPerEntry?: HmiProperty<number>;
  wordWrap?: HmiProperty<boolean>;
  wrapAround?: HmiProperty<boolean>;
  receiveSelectionFrom?: string;
  readonly fields: HmiAuditTrailFieldPresentation[] = [];
}
