import { IHmiObject } from "../IHmiObject.js";
import { HmiImageType } from "./HmiImageType.js";

export class HmiImage implements IHmiObject {
  id?: string;
  name?: string;
  lastModified?: Date;
  imageType: HmiImageType = HmiImageType.Unknown;
  mimeType?: string;
  data = new Uint8Array();
}
