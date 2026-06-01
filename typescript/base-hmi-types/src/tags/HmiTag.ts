import { IHmiObject } from "../IHmiObject.js";

export class HmiTag implements IHmiObject {
  name?: string;
  dataType?: string;
  connection?: string;
  plcTag?: string;
  address?: string;
  refreshType?: string;
  refreshTime?: string;
  multiplexing = false;
  indexTag?: string;
  upper2?: string;
  upper1?: string;
  lower1?: string;
  lower2?: string;
  linearScaling = false;
  scalingPlcHigh = 0;
  scalingPlcLow = 0;
  scalingHmiHigh = 0;
  scalingHmiLow = 0;
  comment?: string;
  crc = 0;
  lidPath?: number[];
  rid = 0;

  get lidPathString(): string | undefined {
    return this.lidPath?.map((value) => (value & 0x0fffffff).toString(16)).join(".");
  }
}
