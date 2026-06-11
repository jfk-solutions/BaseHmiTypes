import { HmiProperty } from "../base.js";
import { HmiButtonBase } from "./HmiButtonBase.js";
import { HmiButtonType } from "./HmiButtonType.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiButton extends HmiButtonBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiButton;
  }

  mode?: HmiProperty<HmiButtonType>;
}
