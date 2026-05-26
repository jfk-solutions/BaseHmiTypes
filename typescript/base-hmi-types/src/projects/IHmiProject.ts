import { HmiScreen } from "../screens/screen/HmiScreen.js";
import { HmiProjectInfo } from "./HmiProjectInfo.js";
import { HmiScreenDescriptor } from "./HmiScreenDescriptor.js";

export interface IHmiProject {
  readonly info: HmiProjectInfo;
  getScreens(signal?: AbortSignal): Promise<readonly HmiScreenDescriptor[]>;
  getScreen(screenId: string, signal?: AbortSignal): Promise<HmiScreen | undefined>;
}
