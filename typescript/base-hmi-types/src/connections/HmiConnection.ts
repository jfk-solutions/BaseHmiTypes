import { IHmiObject } from "../IHmiObject.js";
import { HmiMultilingualText } from "../common/HmiMultilingualText.js";

export class HmiConnection implements IHmiObject {
  lastModified?: Date;
  name?: string;
  comment?: HmiMultilingualText;
  alarmDisplayClasses = 0;
  interfaceType?: string;
  online = false;
  partnerId = 0;
  physicId?: string;
  plcId?: string;
  protocolId?: string;
  receiveNcAlarms?: string;
  receiveNcMessages = false;
  readonly protocolValues: HmiProtocolValue[] = [];
}

export class HmiProtocolValue {
  name?: string;
  value?: string;
}
