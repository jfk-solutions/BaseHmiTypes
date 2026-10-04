import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base/HmiProperty.js";

export class HmiParameterColumn {
  name?: string;
  key?: string;
  headerText?: HmiMultilingualText;
  visible?: HmiProperty<boolean>;
  width?: HmiProperty<number>;
  minimumWidth?: HmiProperty<number>;
  maximumWidth?: HmiProperty<number>;
  allowSort?: HmiProperty<boolean>;
  outputFormat?: HmiProperty<string>;
}
