import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiDataGridColumnWidthMode } from "./HmiDataGridColumnWidthMode.js";
import { HmiDataGridSortDirection } from "./HmiDataGridSortDirection.js";

export class HmiDataGridColumn {
  name?: string;
  dataType?: string;
  visible?: HmiProperty<boolean>;
  headerText?: HmiMultilingualText;
  decimalPlaces?: HmiProperty<number>;
  widthMode?: HmiProperty<HmiDataGridColumnWidthMode>;
  sourceWidthMode?: string;
  width?: HmiProperty<number>;
  order?: HmiProperty<number>;
  filterDefinition?: HmiProperty<string>;
  sortDirection?: HmiProperty<HmiDataGridSortDirection>;
  sourceSortDirection?: string;
  sortPriority?: HmiProperty<number>;
}
