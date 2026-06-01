import { HmiScriptLanguage } from "../screens/base/HmiProperty.js";
import { HmiScriptCommand, HmiScriptCommandParameterDirection } from "./HmiScriptCommand.js";

export type HmiScriptCommandConstructor = new () => HmiScriptCommand;

export class HmiScriptCommandDefinition {
  key = "";
  name = "";
  displayName = "";
  description?: string;
  category?: string;
  language: HmiScriptLanguage = HmiScriptLanguage.Unknown;
  commandType?: HmiScriptCommandConstructor;
  readonly parameters: HmiScriptCommandParameterDefinition[] = [];
}

export class HmiScriptCommandParameterDefinition {
  name = "";
  propertyName = "";
  description?: string;
  direction: HmiScriptCommandParameterDirection = HmiScriptCommandParameterDirection.In;
  readonly acceptedTypes: HmiScriptCommandParameterTypeDefinition[] = [];
}

export class HmiScriptCommandParameterTypeDefinition {
  objectType = "";
  description?: string;
  initialValue?: string;
  readonly valueTypes: string[] = [];
  readonly selectionEntries: HmiScriptCommandSelectionEntryDefinition[] = [];
}

export class HmiScriptCommandSelectionEntryDefinition {
  value = "";
  description?: string;
  scriptConstant?: string;
}
