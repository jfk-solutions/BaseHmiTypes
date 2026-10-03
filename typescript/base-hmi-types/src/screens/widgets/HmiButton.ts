import { HmiProperty } from "../base.js";
import { HmiButtonBase } from "./HmiButtonBase.js";
import { HmiButtonType } from "./HmiButtonType.js";
import { HmiButtonShape } from "./HmiButtonShape.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiButton extends HmiButtonBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiButton;
  }

  mode?: HmiProperty<HmiButtonType>;
  /** Ellipse gives a circular outline when width and height are equal. */
  shape?: HmiProperty<HmiButtonShape>;
}
