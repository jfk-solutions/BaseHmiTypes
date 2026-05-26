import { HmiScreen } from "../screens/screen/HmiScreen.js";
import { HmiProjectInfo } from "./HmiProjectInfo.js";
import { HmiScreenDescriptor } from "./HmiScreenDescriptor.js";
import { IHmiProject } from "./IHmiProject.js";

export abstract class HmiProjectBase implements IHmiProject {
  readonly info = new HmiProjectInfo();
  abstract getScreens(signal?: AbortSignal): Promise<readonly HmiScreenDescriptor[]>;
  abstract getScreen(screenId: string, signal?: AbortSignal): Promise<HmiScreen | undefined>;
}
