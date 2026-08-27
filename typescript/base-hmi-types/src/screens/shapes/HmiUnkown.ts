import { HmiSurfaceShapeBase } from "./HmiSurfaceShapeBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiUnkown extends HmiSurfaceShapeBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiUnkown;
  }

  type?: string;
  sourceFormat?: string;
  sourceData?: Uint8Array;
  readonly sourceProperties: Record<string, string> = {};
}
