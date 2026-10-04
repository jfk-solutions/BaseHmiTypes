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
  /** True paints image and caption over the same content area with independent alignment. False/omitted retains the stacked preview. */
  overlayContent?: HmiProperty<boolean>;
  /** Ellipse gives a circular outline when width and height are equal. */
  shape?: HmiProperty<HmiButtonShape>;
  /** For frames wider than one pixel, false centers the stroke on the bounds. True/omitted draws inside. The 3D bevel is separate. */
  drawStrokeInsideFrame?: HmiProperty<boolean>;
  /** The configured pressed snapshot; preview rendering does not change tags or operate the button. */
  pressed?: HmiProperty<boolean>;
  /** True identifies a latching/toggle button, exposing its pressed snapshot as an accessible toggle state. */
  toggle?: HmiProperty<boolean>;
}
