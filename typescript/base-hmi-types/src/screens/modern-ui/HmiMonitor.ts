import { HmiProperty, staticProperty } from "../base.js";

export class HmiMonitor {
  name?: string;
  width: HmiProperty<number> = staticProperty(0);
  height: HmiProperty<number> = staticProperty(0);
}
