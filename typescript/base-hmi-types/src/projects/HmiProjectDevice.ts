import { HmiDeviceInfo } from "./HmiDeviceInfo.js";
import { HmiProjectFolder } from "./HmiProjectFolder.js";
import { HmiProjectFolderType } from "./HmiProjectFolderType.js";
import { IHmiProjectFolder } from "./IHmiProject.js";

/** A device node containing its screens, tags and other device-owned folders. */
export class HmiProjectDevice extends HmiProjectFolder {
  constructor(readonly info: HmiDeviceInfo, folders: readonly IHmiProjectFolder[]) {
    super(HmiProjectFolderType.Device, info.name, info.id, info.name, folders);
  }
}
