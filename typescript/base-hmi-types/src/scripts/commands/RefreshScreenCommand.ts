import { HmiScriptCommand } from "../HmiScriptCommand.js";

/** Requests a fresh read of every process tag used by the active screen. */
export class RefreshScreenCommand extends HmiScriptCommand {
  get commandName(): string { return "RefreshScreen"; }
}
