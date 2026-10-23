import { HmiScriptCommand, HmiScriptCommandParameterDirection } from "../HmiScriptCommand.js";

/** Clear a source-defined message buffer, keeping its selector distinct from an alarm class. */
export class ClearMessageBufferCommand extends HmiScriptCommand {
  readonly bufferType;
  constructor() {
    super();
    this.bufferType = this.addArgument("BufferType", "Buffer type", HmiScriptCommandParameterDirection.In);
  }
  get commandName(): string { return "ClearMessageBuffer"; }
}
