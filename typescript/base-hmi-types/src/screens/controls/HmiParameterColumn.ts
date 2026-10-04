import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base/HmiProperty.js";

import { HmiHorizontalAlignment } from "../base/HmiHorizontalAlignment.js";
import { HmiVerticalAlignment } from "../base/HmiVerticalAlignment.js";

export class HmiParameterColumn {
  name?: string;
  key?: string;
  headerText?: HmiMultilingualText;
  headerHorizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  headerVerticalAlignment?: HmiProperty<HmiVerticalAlignment>;
  visible?: HmiProperty<boolean>;
  width?: HmiProperty<number>;
  minimumWidth?: HmiProperty<number>;
  maximumWidth?: HmiProperty<number>;
  allowSort?: HmiProperty<boolean>;
  outputFormat?: HmiProperty<string>;
}
