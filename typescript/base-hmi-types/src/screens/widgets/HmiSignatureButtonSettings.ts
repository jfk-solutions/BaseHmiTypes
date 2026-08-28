import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";

export enum HmiSignatureButtonOperation {
  SetNumericValue = "SetNumericValue",
  SetStringValue = "SetStringValue",
  SetBooleanValue = "SetBooleanValue",
  SetDateTimeValue = "SetDateTimeValue",
  SendCommand = "SendCommand",
  DownloadInputValues = "DownloadInputValues",
}

export class HmiSignatureButtonSettings {
  operation?: HmiSignatureButtonOperation;
  windowTitle?: HmiMultilingualText;
  operationDescription?: HmiMultilingualText;
  numericMinimum?: number;
  numericMaximum?: number;
  decimalPlaces?: number;
  command?: string;
  valueExpression?: string;
  datePartExpression?: string;
  timePartExpression?: string;
  dateTimeStringExpression?: string;
  performerAuthenticationEnabled?: boolean;
  performerGroup?: string;
  approverAuthenticationEnabled?: boolean;
  approverGroup?: string;
  defaultDomain?: string;
}
