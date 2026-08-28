import { HmiAction } from "./HmiAction.js";
import type { HmiProperty } from "../screens/base/HmiProperty.js";

export class HmiEventBinding {
  eventName = "";
  action?: HmiAction;
  condition?: HmiProperty<boolean>;
  repeatIntervalSeconds?: number;
}
