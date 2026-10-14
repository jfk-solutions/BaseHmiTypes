import { IHmiObject } from "../IHmiObject.js";

export class HmiTag implements IHmiObject {
  lastModified?: Date;
  name?: string;
  dataType?: string;
  nativeDataType?: string;
  sourceType?: string;
  connection?: string;
  plcTag?: string;
  address?: string;
  readOnly?: boolean;
  accessRight?: string;
  alarmed?: boolean;
  retentive?: boolean;
  securityCode?: string;
  externalReferenceCount?: number;
  parentId?: string;
  parentType?: number;
  initialValue?: string;
  minimumValue?: number;
  maximumValue?: number;
  scale?: number;
  offset?: number;
  unit?: string;
  offLabel?: string;
  onLabel?: string;
  stringLength?: number;
  nativeValueType?: number;
  valueType?: string;
  elementSize?: number;
  elementCount?: number;
  refreshType?: string;
  refreshTime?: string;
  /** Neutral acquisition policy: OnDemand, CyclicOnUse or CyclicContinuous. */
  acquisitionMode?: string;
  /** Name of the configured acquisition cycle. */
  acquisitionCycle?: string;
  /** PLC refresh group consumed by UpdateTag. */
  updateId?: number;
  multiplexing = false;
  indexTag?: string;
  /** Selector values mapped to concrete tag names for native multiplexing. */
  multiplexTargets?: Record<string, string>;
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
