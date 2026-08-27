import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base.js";
import { HmiAuditTrailField } from "./HmiAuditTrailField.js";

export class HmiAuditTrailFieldPresentation {
  field = HmiAuditTrailField.Unknown;
  sourceType?: string;
  visible?: HmiProperty<boolean>;
  width?: HmiProperty<number>;
  timeAndDateFormat?: string;
  headerText?: HmiMultilingualText;
}
