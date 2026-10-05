import { IHmiObject } from "../IHmiObject.js";
import { HmiMultilingualText } from "../common/HmiMultilingualText.js";

export class HmiTextList implements IHmiObject {
  defaultEntryReference?: HmiTextListEntryReference;
  lastModified?: Date;
  name?: string;
  kind: HmiTextGraphicListKind = HmiTextGraphicListKind.Hmi;
  rangeType: HmiListRangeType = HmiListRangeType.Decimal;
  comment?: HmiMultilingualText;
  readonly entries: HmiTextListEntry[] = [];
}

export class HmiTextListEntry {
  sourceId?: string;
  entryType?: HmiTextListEntryType;
  name?: string;
  from = 0;
  to = 0;
  default = false;
  text?: HmiMultilingualText;
}

export enum HmiTextGraphicListKind {
  Hmi = "Hmi",
}

export enum HmiListRangeType {
  Decimal = "Decimal",
  Binary = "Binary",
  Bit = "Bit",
}

export class HmiTextListEntryReference {
  sourceId?: string;
  name?: string;
}

export enum HmiTextListEntryType {
  SingleValue = 0,
  Range = 1,
  To = 2,
  From = 3,
}
