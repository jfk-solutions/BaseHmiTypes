import { HmiScriptLanguage } from "../screens/base/HmiProperty.js";
import { HmiScriptCommand } from "./HmiScriptCommand.js";

export enum HmiActionKind {
  CommandList = "CommandList",
  TextScript = "TextScript",
}

export abstract class HmiAction {
  abstract readonly kind: HmiActionKind;
}

export class HmiCommandListAction extends HmiAction {
  readonly kind = HmiActionKind.CommandList;
  readonly commands: HmiScriptCommand[] = [];
}

export class HmiTextScriptAction extends HmiAction {
  readonly kind = HmiActionKind.TextScript;
  language: HmiScriptLanguage = HmiScriptLanguage.Unknown;
  sourceCode?: string;
}
