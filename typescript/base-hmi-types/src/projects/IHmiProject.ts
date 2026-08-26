import { HmiAlarmList } from "../alarms/HmiAlarm.js";
import { HmiConnectionList } from "../connections/HmiConnectionList.js";
import { HmiCycle } from "../cycles/HmiCycle.js";
import { HmiImage } from "../images/HmiImage.js";
import { HmiRecipe } from "../recipes/HmiRecipe.js";
import { HmiFaceplateType } from "../screens/base/HmiFaceplateType.js";
import { HmiScreenBase } from "../screens/base/HmiScreenBase.js";
import { HmiScript } from "../scripts/HmiScript.js";
import { HmiTagTable } from "../tags/HmiTagTable.js";
import { HmiGraphicList } from "../text-graphic-lists/HmiGraphicList.js";
import { HmiTextList } from "../text-graphic-lists/HmiTextList.js";
import { HmiProjectFolderType } from "./HmiProjectFolderType.js";
import { IHmiProjectItemDescriptor } from "./HmiProjectItemDescriptor.js";
import { HmiProjectInfo } from "./HmiProjectInfo.js";

export interface IHmiProject
  extends IHmiProjectFolder,
    IHmiScreenProvider,
    IHmiFaceplateProvider,
    IHmiTagProvider,
    IHmiScriptProvider,
    IHmiTextListProvider,
    IHmiGraphicListProvider,
    IHmiImageProvider,
    IHmiCycleProvider,
    IHmiAlarmProvider,
    IHmiConnectionProvider,
    IHmiRecipeProvider {
  readonly info: HmiProjectInfo;
}

export interface IHmiProjectFolder {
  readonly id?: string | undefined;
  readonly name: string;
  readonly path: string;
  readonly folderType: HmiProjectFolderType;
  readonly folders: readonly IHmiProjectFolder[];
  readonly items: readonly IHmiProjectItemDescriptor[];
  getFolders(signal?: AbortSignal): Promise<readonly IHmiProjectFolder[]>;
  getItems(signal?: AbortSignal): Promise<readonly IHmiProjectItemDescriptor[]>;
}

export interface IHmiScreenProvider {
  getScreen(id: string, signal?: AbortSignal): Promise<HmiScreenBase | undefined>;
}

export interface IHmiFaceplateProvider {
  getFaceplate(id: string, signal?: AbortSignal): Promise<HmiFaceplateType | undefined>;
  getFaceplateByNameAndVersion(name: string, version: string, signal?: AbortSignal): Promise<HmiFaceplateType | undefined>;
}

export interface IHmiTagProvider {
  getTagTable(id: string, signal?: AbortSignal): Promise<HmiTagTable | undefined>;
}

export interface IHmiScriptProvider {
  getScript(id: string, signal?: AbortSignal): Promise<HmiScript | undefined>;
}

export interface IHmiTextListProvider {
  getTextList(id: string, signal?: AbortSignal): Promise<HmiTextList | undefined>;
}

export interface IHmiGraphicListProvider {
  getGraphicList(id: string, signal?: AbortSignal): Promise<HmiGraphicList | undefined>;
}

export interface IHmiImageProvider {
  getImage(id: string, signal?: AbortSignal): Promise<HmiImage | undefined>;
}

export interface IHmiCycleProvider {
  getCycle(id: string, signal?: AbortSignal): Promise<HmiCycle | undefined>;
}

export interface IHmiAlarmProvider {
  getAlarmList(id: string, signal?: AbortSignal): Promise<HmiAlarmList | undefined>;
}

export interface IHmiConnectionProvider {
  getConnectionList(id: string, signal?: AbortSignal): Promise<HmiConnectionList | undefined>;
}

export interface IHmiRecipeProvider {
  getRecipe(id: string, signal?: AbortSignal): Promise<HmiRecipe | undefined>;
}
