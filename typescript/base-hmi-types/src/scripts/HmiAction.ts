import {
  HmiScriptLanguage,
  type HmiProperty,
} from "../screens/base/HmiProperty.js";
import { HmiScriptCommand } from "./HmiScriptCommand.js";

export enum HmiActionKind {
  CommandList = "CommandList",
  TextScript = "TextScript",
  OpenResource = "OpenResource",
  OleVerb = "OleVerb",
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

/** Describes an inert request to open a URL or file resource. */
export class HmiOpenResourceAction extends HmiAction {
  readonly kind = HmiActionKind.OpenResource;
  address?: HmiProperty<string>;
}

/** Describes an inert request to invoke a verb on an embedded OLE object. */
export class HmiOleVerbAction extends HmiAction {
  readonly kind = HmiActionKind.OleVerb;
  verb?: string;
  securityCode?: string;
}
