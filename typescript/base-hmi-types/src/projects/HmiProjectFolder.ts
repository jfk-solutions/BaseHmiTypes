import { HmiProjectFolderType } from "./HmiProjectFolderType.js";
import { IHmiProjectFolder } from "./IHmiProject.js";
import { IHmiProjectItemDescriptor } from "./HmiProjectItemDescriptor.js";

export class HmiProjectFolder implements IHmiProjectFolder {
  private readonly getFoldersCore: (signal?: AbortSignal) => Promise<readonly IHmiProjectFolder[]>;
  private readonly getItemsCore: (signal?: AbortSignal) => Promise<readonly IHmiProjectItemDescriptor[]>;

  readonly id?: string;
  readonly name: string;
  readonly path: string;
  readonly folderType: HmiProjectFolderType;

  constructor(
    folderType: HmiProjectFolderType,
    name: string,
    id?: string,
    path?: string,
    getFolders?: (signal?: AbortSignal) => Promise<readonly IHmiProjectFolder[]>,
    getItems?: (signal?: AbortSignal) => Promise<readonly IHmiProjectItemDescriptor[]>,
  ) {
    this.folderType = folderType;
    this.name = name;
    this.id = id;
    this.path = path ?? name;
    this.getFoldersCore = getFolders ?? (() => Promise.resolve([]));
    this.getItemsCore = getItems ?? (() => Promise.resolve([]));
  }

  get folders(): readonly IHmiProjectFolder[] {
    return [];
  }

  get items(): readonly IHmiProjectItemDescriptor[] {
    return [];
  }

  getFolders(signal?: AbortSignal): Promise<readonly IHmiProjectFolder[]> {
    return this.getFoldersCore(signal);
  }

  getItems(signal?: AbortSignal): Promise<readonly IHmiProjectItemDescriptor[]> {
    return this.getItemsCore(signal);
  }
}
