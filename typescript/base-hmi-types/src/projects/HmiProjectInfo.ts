import { HmiProjectSoftwareType } from "./HmiProjectSoftwareType.js";

export class HmiProjectInfo {
  hmiProjectSoftwareType: HmiProjectSoftwareType = HmiProjectSoftwareType.Unknown;
  projectTitle?: string;
  deviceFamilyString?: string;
  projectName?: string;
  projectVersionString?: string;
  author?: string;
  engineeringSoftwareVersionString?: string;
  originalDateString?: string;
  lastModifiedDateString?: string;
}
