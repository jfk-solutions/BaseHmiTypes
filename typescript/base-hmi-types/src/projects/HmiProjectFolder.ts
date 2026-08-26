import { HmiProjectFolderType } from "./HmiProjectFolderType.js";
import { IHmiProjectFolder } from "./IHmiProject.js";
import { IHmiProjectItemDescriptor } from "./HmiProjectItemDescriptor.js";

export class HmiProjectFolder implements IHmiProjectFolder {
  private readonly getFoldersCore: (signal?: AbortSignal) => Promise<readonly IHmiProjectFolder[]>;
  private readonly getItemsCore: (signal?: AbortSignal) => Promise<readonly IHmiProjectItemDescriptor[]>;
  private folderValues: readonly IHmiProjectFolder[];
  private itemValues: readonly IHmiProjectItemDescriptor[];

  readonly id?: string | undefined;
  readonly name: string;
  readonly path: string;
  readonly folderType: HmiProjectFolderType;

  constructor(
    folderType: HmiProjectFolderType,
    name: string,
    id?: string,
    path?: string,
    getFolders?:
      | readonly IHmiProjectFolder[]
      | ((signal?: AbortSignal) => Promise<readonly IHmiProjectFolder[]>),
    getItems?:
      | readonly IHmiProjectItemDescriptor[]
      | ((signal?: AbortSignal) => Promise<readonly IHmiProjectItemDescriptor[]>),
  ) {
    this.folderType = folderType;
    this.name = name;
    this.id = id;
    this.path = path ?? name;
    this.folderValues = typeof getFolders === "function" ? [] : (getFolders ?? []);
    this.itemValues = typeof getItems === "function" ? [] : (getItems ?? []);
    this.getFoldersCore =
      typeof getFolders === "function"
        ? async signal => (this.folderValues = await getFolders(signal))
        : () => Promise.resolve(this.folderValues);
    this.getItemsCore =
      typeof getItems === "function"
        ? async signal => (this.itemValues = await getItems(signal))
        : () => Promise.resolve(this.itemValues);
  }

  get folders(): readonly IHmiProjectFolder[] {
    return this.folderValues;
  }

  get items(): readonly IHmiProjectItemDescriptor[] {
    return this.itemValues;
  }

  getFolders(signal?: AbortSignal): Promise<readonly IHmiProjectFolder[]> {
    return this.getFoldersCore(signal);
  }

  getItems(signal?: AbortSignal): Promise<readonly IHmiProjectItemDescriptor[]> {
    return this.getItemsCore(signal);
  }
}
