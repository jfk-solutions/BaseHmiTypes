import { HmiParameterControlBase } from "./HmiParameterControlBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base/HmiProperty.js";

export class HmiOverviewParameterControl extends HmiParameterControlBase {
  constructor() { super(); this.hmiObjectType = HmiObjectType.HmiOverviewParameterControl; }
  filter?: HmiProperty<string>;
}
