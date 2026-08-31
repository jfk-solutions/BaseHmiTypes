import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiHorizontalAlignment, HmiProperty } from "../base.js";
import { HmiSystemDiagnosisColumnType } from "./HmiSystemDiagnosisColumnType.js";

export class HmiSystemDiagnosisColumn {
  type = HmiSystemDiagnosisColumnType.Unknown;
  sourceType?: string;
  visible?: HmiProperty<boolean>;
  width?: HmiProperty<number>;
  headerText?: HmiMultilingualText;
  alignment?: HmiProperty<HmiHorizontalAlignment>;
  format?: string;
  order?: HmiProperty<number>;
}
