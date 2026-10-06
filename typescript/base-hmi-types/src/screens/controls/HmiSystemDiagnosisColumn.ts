import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiHorizontalAlignment, HmiVerticalAlignment, HmiProperty } from "../base.js";
import { HmiSystemDiagnosisColumnType } from "./HmiSystemDiagnosisColumnType.js";

export class HmiSystemDiagnosisColumn {
  type = HmiSystemDiagnosisColumnType.Unknown;
  sourceType?: string;
  visible?: HmiProperty<boolean>;
  width?: HmiProperty<number>;
  headerText?: HmiMultilingualText;
  headerTextTrimming?: HmiProperty<number>;
  contentTextTrimming?: HmiProperty<number>;
  alignment?: HmiProperty<HmiHorizontalAlignment>;
  headerHorizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  headerVerticalAlignment?: HmiProperty<HmiVerticalAlignment>;
  format?: string;
  order?: HmiProperty<number>;
  allowSort?: HmiProperty<boolean>;
  sortOrder?: HmiProperty<number>;
  sortDirection?: HmiProperty<number>;
}
