import { HmiProperty } from "../base.js";
import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiRectangle extends HmiSurfaceShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiRectangle;
  }

  topLeftRadius?: HmiProperty<{ x: number; y: number }>;
  topRightRadius?: HmiProperty<{ x: number; y: number }>;
  bottomLeftRadius?: HmiProperty<{ x: number; y: number }>;
  bottomRightRadius?: HmiProperty<{ x: number; y: number }>;
  cornerRadius?: HmiProperty<number>;
  cornerStyle?: HmiProperty<number>;
}
