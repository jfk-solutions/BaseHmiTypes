import { IHmiObject } from "../IHmiObject.js";
import { HmiMultilingualText } from "../common/HmiMultilingualText.js";
import { HmiColor } from "../screens/base/HmiColor.js";

export abstract class HmiAlarm implements IHmiObject {
  lastModified?: Date;
  name?: string;
}

export class HmiAlarmClass {
  name?: string;
  priority = 0;
  acknowledgement = false;

  toString(): string {
    return `${this.name ?? ""} (${this.priority})`;
  }
}

export abstract class HmiBaseAlarm extends HmiAlarm {
  tiaAlarmId = 0;
  alarmId = 0;
  priority = 0;
  alarmClass?: HmiAlarmClass;
  alarmText?: HmiMultilingualText;
  infoText?: HmiMultilingualText;
  additionalText1?: HmiMultilingualText;
  additionalText2?: HmiMultilingualText;
  additionalText3?: HmiMultilingualText;
  additionalText4?: HmiMultilingualText;
  additionalText5?: HmiMultilingualText;
  additionalText6?: HmiMultilingualText;
  additionalText7?: HmiMultilingualText;
  additionalText8?: HmiMultilingualText;
  additionalText9?: HmiMultilingualText;
  processValueTag1?: string;
  processValueTag2?: string;
  processValueTag3?: string;
  processValueTag4?: string;
  processValueTag5?: string;
  processValueTag6?: string;
  processValueTag7?: string;
  processValueTag8?: string;
  processValueTag9?: string;
  processValueTag10?: string;
  area?: string;
  origin?: string;
  triggerLabel?: string;
  messageSource?: string;
  fileMessage?: HmiMultilingualText;
  printerMessage?: HmiMultilingualText;
  outOfAlarmLabel?: string;
  outOfAlarmMessageSource?: string;
  outOfAlarmFileMessage?: HmiMultilingualText;
  outOfAlarmPrinterMessage?: HmiMultilingualText;
  acknowledgeMessageSource?: string;
  acknowledgeFileMessage?: HmiMultilingualText;
  acknowledgePrinterMessage?: HmiMultilingualText;
  alarmIdentification?: string;
}

export class HmiDiscreteAlarm extends HmiBaseAlarm {
  triggerTag?: string;
  triggerBitNumber = 0;
  triggerMode?: string;
  acknowledgementTag?: string;
  acknowledgementBitNumber = 0;
  plcAcknowledgementTag?: string;
  plcAcknowledgementBitNumber = 0;
  triggerValue?: number;
  triggerReference?: string;
  useAcknowledgeAll?: boolean;
  acknowledgeAllValue?: number;
  handshakeTag?: string;
  remoteAcknowledgeExpression?: string;
  remoteAcknowledgeHandshakeTag?: string;
  messageTag?: string;
  messageNotificationTag?: string;
  messageHandshakeExpression?: string;
  backgroundColor?: HmiColor;
  foregroundColor?: HmiColor;
  audioEnabled?: boolean;
  displayEnabled?: boolean;
  printEnabled?: boolean;
  writeMessageToTag?: boolean;
  acknowledgementAutoReset?: boolean;
  handshakeAutoReset?: boolean;
}

export class HmiAnalogAlarm extends HmiBaseAlarm {
  triggerTag?: string;
  limitMode?: string;
  limitValueConstant?: string;
  limitValueTag?: string;
  limitValueType?: string;
  deadbandValue?: number;
  deadbandPercentage?: boolean;
  acknowledgementTag?: string;
  acknowledgementAutoReset?: boolean;
  handshakeTag?: string;
  handshakeAutoReset?: boolean;
}

export class HmiOpcUaAlarm extends HmiAlarm {
  area?: string;
  conditionTypeId?: string;
  lastSyncTime = new Date(0);
  notifyNodeId?: string;
  connection?: string;
}

export class HmiSystemAlarm extends HmiAlarm {
  tiaAlarmId = 0;
  alarmId = 0;
  alarmClass?: HmiAlarmClass;
  alarmText?: HmiMultilingualText;
}

export class HmiAlarmList implements IHmiObject {
  lastModified?: Date;
  name?: string;
  hmiAlarmListType: HmiAlarmListType = HmiAlarmListType.Discrete;
  readonly alarms: HmiAlarm[] = [];
  historySize?: number;
  holdTimeMilliseconds?: number;
  maximumUpdateRateSeconds?: number;
  silenceTag?: string;
  remoteSilenceExpression?: string;
  remoteAcknowledgeAllExpression?: string;
  statusResetTag?: string;
  remoteStatusResetExpression?: string;
  closeDisplayTag?: string;
  remoteCloseDisplayExpression?: string;
  useAlarmIdentifier?: boolean;
}

export enum HmiAlarmListType {
  Discrete = "Discrete",
  Analog = "Analog",
  OpcUa = "OpcUa",
  System = "System",
}
