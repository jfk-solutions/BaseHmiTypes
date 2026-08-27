import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base.js";
import { HmiRecipeColumnType } from "./HmiRecipeColumnType.js";

export class HmiRecipeColumn {
  type = HmiRecipeColumnType.Unknown;
  sourceType?: string;
  visible?: HmiProperty<boolean>;
  width?: HmiProperty<number>;
  headerText?: HmiMultilingualText;
}
