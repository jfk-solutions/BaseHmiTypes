import { HmiScriptCommandDefinition } from "./HmiScriptCommandDefinition.js";

export interface IHmiScriptCommandCatalog {
  readonly definitions: readonly HmiScriptCommandDefinition[];
  findByKey(key: string): HmiScriptCommandDefinition | undefined;
  findByName(name: string): HmiScriptCommandDefinition | undefined;
}

export class HmiScriptCommandCatalog implements IHmiScriptCommandCatalog {
  readonly definitions: readonly HmiScriptCommandDefinition[];

  constructor(definitions: readonly HmiScriptCommandDefinition[]) {
    this.definitions = definitions;
  }

  findByKey(key: string): HmiScriptCommandDefinition | undefined {
    return this.definitions.find((definition) => definition.key === key);
  }

  findByName(name: string): HmiScriptCommandDefinition | undefined {
    return this.definitions.find((definition) => definition.name === name);
  }
}
