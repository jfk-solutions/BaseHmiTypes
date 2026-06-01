import { IHmiObject } from "../IHmiObject.js";
import { HmiCycle } from "./HmiCycle.js";

export class HmiCycleList implements IHmiObject {
  lastModified?: Date;
  name?: string;
  readonly hmiCycles: HmiCycle[] = [];
}
