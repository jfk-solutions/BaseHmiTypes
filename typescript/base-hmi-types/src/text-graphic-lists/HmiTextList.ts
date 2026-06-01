import { IHmiObject } from "../IHmiObject.js";
import { HmiMultilingualText } from "../common/HmiMultilingualText.js";

export class HmiTextList implements IHmiObject {
  lastModified?: Date;
  name?: string;
  kind: HmiTextGraphicListKind = HmiTextGraphicListKind.Hmi;
  rangeType: HmiListRangeType = HmiListRangeType.Decimal;
  comment?: HmiMultilingualText;
  readonly entries: HmiTextListEntry[] = [];
}

export class HmiTextListEntry {
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
