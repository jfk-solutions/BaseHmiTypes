import { HmiProperty } from "../base.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiRectangle extends HmiSurfaceShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiRectangle;
  }

  topLeftRadius?: HmiProperty<number>;
  topRightRadius?: HmiProperty<number>;
  bottomLeftRadius?: HmiProperty<number>;
  bottomRightRadius?: HmiProperty<number>;
  cornerRadius?: HmiProperty<number>;
  cornerStyle?: HmiProperty<number>;
  edgeStyle?: HmiProperty<number>;
}
