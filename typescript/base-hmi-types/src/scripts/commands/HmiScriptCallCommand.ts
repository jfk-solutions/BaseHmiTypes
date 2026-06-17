import { HmiScriptLanguage } from "../../screens/base/HmiProperty.js";
import { HmiScriptCommand, HmiScriptCommandParameterDirection } from "../HmiScriptCommand.js";

export class HmiScriptCallCommand extends HmiScriptCommand {
  scriptName?: string;
  language = HmiScriptLanguage.Unknown;

  constructor() {
    super();
    this.addArgument("ScriptName", "Script name", HmiScriptCommandParameterDirection.In);
  }

  get commandName(): string {
    return "CallScript";
  }
}
