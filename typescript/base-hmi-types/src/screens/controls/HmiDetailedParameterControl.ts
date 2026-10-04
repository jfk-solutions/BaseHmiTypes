import { HmiParameterControlBase } from "./HmiParameterControlBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";

export class HmiDetailedParameterControl extends HmiParameterControlBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiDetailedParameterControl;
  }
  parameterSetTypeFixed?: HmiProperty<boolean>;
  currentParameterSetId?: HmiProperty<number>;
  currentParameterSetTypeId?: HmiProperty<number>;
  parameterSetTypeLabel?: HmiProperty<HmiMultilingualText>;
  parameterSetLabel?: HmiProperty<HmiMultilingualText>;
  numberLabel?: HmiProperty<HmiMultilingualText>;
  hideDetails?: HmiProperty<boolean>;
}
