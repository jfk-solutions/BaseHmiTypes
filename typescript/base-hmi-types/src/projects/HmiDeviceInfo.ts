import type { HmiDeviceFrame } from "./HmiDeviceFrame.js";

/** Engineering identity and configuration of an HMI device. */
export class HmiDeviceInfo {
  id = "";
  name = "";
  deviceType?: string;
  frame?: HmiDeviceFrame;
  startScreenId?: string;
  author?: string;
  comment?: string;
}
