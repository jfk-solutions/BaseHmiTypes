import { HmiScriptCommand, HmiScriptCommandParameterDirection } from "../HmiScriptCommand.js";

export class HmiScriptCallCommand extends HmiScriptCommand {
  scriptName?: string;

  constructor() {
    super();
    this.addArgument("scriptName", "ScriptName", HmiScriptCommandParameterDirection.In);
  }

  get commandName(): string {
    return "ScriptCall";
  }
}
