import { HmiLineStyle, HmiProperty } from "../base.js";
import { HmiShapeBase } from "./HmiShapeBase.js";

export abstract class HmiSurfaceShapeBase extends HmiShapeBase {
  edgeStyle?: HmiProperty<HmiLineStyle>;
}
