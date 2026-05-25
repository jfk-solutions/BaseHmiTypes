import { HmiFaceplateType } from "./screens/base.js";
import { HmiScreen, HmiScreenMaster } from "./screens/screens.js";

export abstract class HmiProjectBase {
  readonly info = new HmiProjectInfo();
  readonly screens: HmiScreen[] = [];
  readonly screenMasters: HmiScreenMaster[] = [];
  readonly faceplateTypes: HmiFaceplateType[] = [];
}

export class HmiProject extends HmiProjectBase {}

export class HmiProjectInfo {
  projectTitle?: string;
  deviceFamilyString?: string;
  projectName?: string;
  author?: string;
  engineeringSoftwareVersionString?: string;
  originalDateString?: string;
}
