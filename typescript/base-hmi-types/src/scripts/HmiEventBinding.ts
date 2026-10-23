import { HmiAction } from "./HmiAction.js";
import type { HmiProperty } from "../screens/base/HmiProperty.js";

export class HmiEventBinding {
  eventName = "";
  sourceFormat?: string;
  sourceData?: Uint8Array;
  sourceProperties: Record<string,string> = {};
  action?: HmiAction;
  condition?: HmiProperty<boolean>;
  repeatIntervalSeconds?: number;
}
