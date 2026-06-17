export abstract class HmiScriptCommand {
  private readonly argumentsCore: HmiScriptCommandArgument[] = [];

  abstract get commandName(): string;

  get commandKey(): string {
    return this.commandName;
  }

  get arguments(): HmiScriptCommandArgument[] {
    return this.argumentsCore;
  }

  protected addArgument(propertyName: string, parameterName: string, direction: HmiScriptCommandParameterDirection): HmiScriptCommandArgument {
    const argument = new HmiScriptCommandArgument();
    argument.propertyName = propertyName;
    argument.parameterName = parameterName;
    argument.direction = direction;
    this.argumentsCore.push(argument);
    return argument;
  }
}

export class HmiScriptCommandArgument {
  propertyName = "";
  parameterName = "";
  direction: HmiScriptCommandParameterDirection = HmiScriptCommandParameterDirection.In;
  value?: HmiScriptArgumentValue;
}

export class HmiScriptArgumentValue {
  sourceKind: HmiScriptArgumentSourceKind = HmiScriptArgumentSourceKind.Unknown;
  rawValue?: string;
  value?: unknown;
  objectType?: string;
  valueType?: string;
}

export enum HmiScriptArgumentSourceKind {
  Unknown = "Unknown",
  Constant = "Constant",
  ObjectReference = "ObjectReference",
  Integer = "Integer",
  Double = "Double",
  Enum = "Enum",
  Text = "Text",
}

export enum HmiScriptCommandParameterDirection {
  In = "In",
  Out = "Out",
  Return = "Return",
}
