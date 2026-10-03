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
  /** For frames wider than one pixel, false centers the stroke on the bounds. True/omitted draws inside. The 3D bevel is separate. */
  drawStrokeInsideFrame?: HmiProperty<boolean>;
}
