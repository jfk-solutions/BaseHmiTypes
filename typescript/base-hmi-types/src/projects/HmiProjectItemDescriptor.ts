import { HmiProjectFolderType } from "./HmiProjectFolderType.js";
import { HmiProjectItemKind } from "./HmiProjectItemKind.js";

export interface IHmiProjectItemDescriptor {
  id: string;
  name: string;
  path: string;
  kind: HmiProjectItemKind;
  folderType: HmiProjectFolderType;
  sourceType?: string | undefined;
}

export class HmiProjectItemDescriptor implements IHmiProjectItemDescriptor {
  id = "";
  name = "";
  path = "";
  kind: HmiProjectItemKind = HmiProjectItemKind.Unknown;
  folderType: HmiProjectFolderType = HmiProjectFolderType.Unknown;
  sourceType?: string | undefined;
}
