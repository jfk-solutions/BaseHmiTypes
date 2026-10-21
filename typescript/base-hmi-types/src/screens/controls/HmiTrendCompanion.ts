import { HmiCompanionBase } from "../base/HmiCompanionBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";

/** A configured column in one of the companion's three evaluation views. */
export class HmiTrendCompanionColumn {
  mode = 0;
  infoBlock = 0;
  name?: string;
  headerText?: HmiMultilingualText;
  visible?: HmiProperty<boolean>;
  width?: HmiProperty<number>;
}

export class HmiTrendCompanion extends HmiCompanionBase {
  sourceControlId?: string;
  sourceControlName?: HmiProperty<string>;
  /** 0: ruler, 1: statistics area, 2: statistics result. */
  mode?: HmiProperty<number>;
  readonly columns: HmiTrendCompanionColumn[] = [];
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiTrendCompanion;
  }
}
