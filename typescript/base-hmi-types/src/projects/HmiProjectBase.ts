import { HmiAlarmList } from "../alarms/HmiAlarm.js";
import { HmiConnectionList } from "../connections/HmiConnectionList.js";
import { HmiCycle } from "../cycles/HmiCycle.js";
import { HmiImage } from "../images/HmiImage.js";
import { HmiFaceplateType } from "../screens/base/HmiFaceplateType.js";
import { HmiScreenBase } from "../screens/base/HmiScreenBase.js";
import { HmiScript } from "../scripts/HmiScript.js";
import { HmiTagTable } from "../tags/HmiTagTable.js";
import { HmiGraphicList } from "../text-graphic-lists/HmiGraphicList.js";
import { HmiTextList } from "../text-graphic-lists/HmiTextList.js";
import { IHmiProject, IHmiProjectFolder } from "./IHmiProject.js";
import { HmiProjectFolderType } from "./HmiProjectFolderType.js";
import { IHmiProjectItemDescriptor } from "./HmiProjectItemDescriptor.js";
import { HmiProjectInfo } from "./HmiProjectInfo.js";
import { HmiProjectItemKind } from "./HmiProjectItemKind.js";
import { HmiScreenDescriptor } from "./HmiScreenDescriptor.js";

export abstract class HmiProjectBase implements IHmiProject {
  readonly info = new HmiProjectInfo();

  get id(): string | undefined {
    return undefined;
  }

  get name(): string {
    return this.info.projectName?.trim() ? this.info.projectName : "Project";
  }

  get path(): string {
    return this.name;
  }

  get folderType(): HmiProjectFolderType {
    return HmiProjectFolderType.Unknown;
  }

  get folders(): readonly IHmiProjectFolder[] {
    return [];
  }

  get items(): readonly IHmiProjectItemDescriptor[] {
    return [];
  }

  get screens(): IHmiProjectFolder | undefined {
    return this.getFolder(HmiProjectFolderType.Screens);
  }

  get faceplates(): IHmiProjectFolder | undefined {
    return this.getFolder(HmiProjectFolderType.Faceplates);
  }

  get tags(): IHmiProjectFolder | undefined {
    return this.getFolder(HmiProjectFolderType.Tags);
  }

  get scripts(): IHmiProjectFolder | undefined {
    return this.getFolder(HmiProjectFolderType.Scripts);
  }

  get textLists(): IHmiProjectFolder | undefined {
    return this.getFolder(HmiProjectFolderType.TextLists);
  }

  get graphicLists(): IHmiProjectFolder | undefined {
    return this.getFolder(HmiProjectFolderType.GraphicLists);
  }

  get images(): IHmiProjectFolder | undefined {
    return this.getFolder(HmiProjectFolderType.Images);
  }

  get cycles(): IHmiProjectFolder | undefined {
    return this.getFolder(HmiProjectFolderType.Cycles);
  }

  get alarms(): IHmiProjectFolder | undefined {
    return this.getFolder(HmiProjectFolderType.Alarms);
  }

  get connections(): IHmiProjectFolder | undefined {
    return this.getFolder(HmiProjectFolderType.Connections);
  }

  getFolders(_signal?: AbortSignal): Promise<readonly IHmiProjectFolder[]> {
    return Promise.resolve([]);
  }

  getItems(_signal?: AbortSignal): Promise<readonly IHmiProjectItemDescriptor[]> {
    return Promise.resolve([]);
  }

  getScreen(_id: string, _signal?: AbortSignal): Promise<HmiScreenBase | undefined> {
    return Promise.resolve(undefined);
  }

  getFaceplate(_id: string, _signal?: AbortSignal): Promise<HmiFaceplateType | undefined> {
    return Promise.resolve(undefined);
  }

  getFaceplateByNameAndVersion(
    _name: string,
    _version: string,
    _signal?: AbortSignal,
  ): Promise<HmiFaceplateType | undefined> {
    return Promise.resolve(undefined);
  }

  getTagTable(_id: string, _signal?: AbortSignal): Promise<HmiTagTable | undefined> {
    return Promise.resolve(undefined);
  }

  getScript(_id: string, _signal?: AbortSignal): Promise<HmiScript | undefined> {
    return Promise.resolve(undefined);
  }

  getTextList(_id: string, _signal?: AbortSignal): Promise<HmiTextList | undefined> {
    return Promise.resolve(undefined);
  }

  getGraphicList(_id: string, _signal?: AbortSignal): Promise<HmiGraphicList | undefined> {
    return Promise.resolve(undefined);
  }

  getImage(_id: string, _signal?: AbortSignal): Promise<HmiImage | undefined> {
    return Promise.resolve(undefined);
  }

  getCycle(_id: string, _signal?: AbortSignal): Promise<HmiCycle | undefined> {
    return Promise.resolve(undefined);
  }

  getAlarmList(_id: string, _signal?: AbortSignal): Promise<HmiAlarmList | undefined> {
    return Promise.resolve(undefined);
  }

  getConnectionList(_id: string, _signal?: AbortSignal): Promise<HmiConnectionList | undefined> {
    return Promise.resolve(undefined);
  }

  async getScreens(signal?: AbortSignal): Promise<readonly HmiScreenDescriptor[]> {
    const result: HmiScreenDescriptor[] = [];
    const screens = this.screens;
    if (screens === undefined) {
      return result;
    }

    await collectScreens(screens, result, signal);
    return result;
  }

  protected getFolder(folderType: HmiProjectFolderType): IHmiProjectFolder | undefined {
    return this.folders.find((folder) => folder.folderType === folderType);
  }
}

async function collectScreens(
  folder: IHmiProjectFolder,
  result: HmiScreenDescriptor[],
  signal?: AbortSignal,
): Promise<void> {
  for (const item of await folder.getItems(signal)) {
    if (item.kind === HmiProjectItemKind.Screen) {
      const descriptor = new HmiScreenDescriptor();
      descriptor.id = item.id;
      descriptor.name = item.name;
      descriptor.displayName = item.name;
      descriptor.path = item.path;
      descriptor.sourceType = item.sourceType;
      result.push(descriptor);
    }
  }

  for (const child of await folder.getFolders(signal)) {
    await collectScreens(child, result, signal);
  }
}
