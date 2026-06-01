import { IHmiObject } from "../IHmiObject.js";
import { HmiMultilingualText } from "../common/HmiMultilingualText.js";

export class HmiCycle implements IHmiObject {
  lastModified?: Date;
  name?: string;
  comment?: HmiMultilingualText;
  consumerType = 0;
  cycleTime = 0;
  cycleUnit?: string;
  fullCycleTime = 0;
  number = 0;
  startAtStartingPoint = false;
  startingPointDay = 0;
  startingPointHour = 0;
  startingPointMinute = 0;
  startingPointMonth = 0;
  startingPointSecond = 0;
  triggerAtShutDown = false;
  triggerAtStartUp = false;
}
