import { HmiScreenBase, HmiScreenModelBase, HmiWindowBase } from "./base.js";

export class HmiTopLevelScreenWindow extends HmiScreenModelBase {}

export class HmiScreen extends HmiScreenBase {}

export class HmiScreenMaster extends HmiScreenBase {}

export class HmiScreenWindow extends HmiWindowBase {
  screen?: HmiScreen;
}

export class HmiPopupScreenWindow extends HmiScreenWindow {}
