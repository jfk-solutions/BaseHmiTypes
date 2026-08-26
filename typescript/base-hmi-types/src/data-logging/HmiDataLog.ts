export class HmiDataLog {
  name?: string;
  comment?: string;
  version?: string;
  storageLocation?: string;
  connectionName?: string;
  readonly retentionPolicy = new HmiDataLogRetentionPolicy();
  readonly groups: HmiDataLogGroup[] = [];
  readonly tags: HmiDataLogTag[] = [];
}

export class HmiDataLogRetentionPolicy {
  enabled = false;
  duration?: number;
  unit?: string;
}

export class HmiDataLogGroup {
  id?: string;
  name?: string;
  readonly trigger = new HmiDataLogTrigger();
}

export class HmiDataLogTag {
  name?: string;
  tag?: string;
  dataType?: string;
  groupId?: string;
  groupName?: string;
  readonly trigger = new HmiDataLogTrigger();
}

export class HmiDataLogTrigger {
  type = HmiDataLogTriggerType.Unknown;
  interval?: number;
  intervalUnit?: string;
  maximumUpdateRate?: number;
  maximumUpdateRateUnit?: string;
  deadbandMode = HmiDataLogDeadbandMode.Unknown;
  deadbandValue?: number;
  heartbeat?: number;
  heartbeatUnit?: string;
}

export enum HmiDataLogTriggerType {
  Unknown = "Unknown",
  Periodic = "Periodic",
  OnChange = "OnChange",
  OnDemand = "OnDemand",
}

export enum HmiDataLogDeadbandMode {
  Unknown = "Unknown",
  None = "None",
  Percentage = "Percentage",
  Absolute = "Absolute",
}
