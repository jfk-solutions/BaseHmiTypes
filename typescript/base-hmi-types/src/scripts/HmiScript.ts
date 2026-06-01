import { IHmiObject } from "../IHmiObject.js";
import { HmiMultilingualText } from "../common/HmiMultilingualText.js";
import { HmiScriptLanguage } from "../screens/base/HmiProperty.js";

export enum HmiScriptType {
  None = "None",
  Sub = "Sub",
  Function = "Function",
}

export class HmiScript implements IHmiObject {
  lastModified?: Date;
  name?: string;
  comment?: HmiMultilingualText;
  language: HmiScriptLanguage = HmiScriptLanguage.Unknown;
  sourceCode?: string;
  preCode?: string;
  scriptType: HmiScriptType = HmiScriptType.None;
}
