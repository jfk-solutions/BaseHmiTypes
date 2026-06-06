import { HmiScreenWindow } from "./HmiScreenWindow.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiPopupScreenWindow extends HmiScreenWindow {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiPopupScreenWindow;
  }
}
