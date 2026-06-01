import { IHmiObject } from "../IHmiObject.js";
import { HmiMultilingualText } from "../common/HmiMultilingualText.js";
import { HmiImageSource } from "../screens/base/HmiImageSource.js";
import { HmiListRangeType, HmiTextGraphicListKind } from "./HmiTextList.js";

export class HmiGraphicList implements IHmiObject {
  lastModified?: Date;
  name?: string;
  mode: HmiGraphicListMode = HmiGraphicListMode.Simple;
  kind: HmiTextGraphicListKind = HmiTextGraphicListKind.Hmi;
  rangeType: HmiListRangeType = HmiListRangeType.Decimal;
  comment?: HmiMultilingualText;
  readonly entries: HmiGraphicListEntry[] = [];
}

export class HmiGraphicListEntry {
  name?: string;
  from = 0;
  to = 0;
  default = false;
  imageName?: string;
  image?: HmiImageSource;
}

export enum HmiGraphicListMode {
  Simple = "Simple",
  Enhanced = "Enhanced",
}
