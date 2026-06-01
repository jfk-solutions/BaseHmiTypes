import { HmiProjectFolderType } from "./HmiProjectFolderType.js";
import { HmiProjectItemDescriptor } from "./HmiProjectItemDescriptor.js";
import { HmiProjectItemKind } from "./HmiProjectItemKind.js";

export class HmiScreenDescriptor extends HmiProjectItemDescriptor {
  displayName?: string;

  constructor() {
    super();
    this.kind = HmiProjectItemKind.Screen;
    this.folderType = HmiProjectFolderType.Screens;
  }
}
