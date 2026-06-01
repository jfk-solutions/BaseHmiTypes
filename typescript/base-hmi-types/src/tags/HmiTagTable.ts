import { IHmiObject } from "../IHmiObject.js";
import { HmiTag } from "./HmiTag.js";

export class HmiTagTable implements IHmiObject {
  lastModified?: Date;
  name?: string;
  readonly tags: HmiTag[] = [];
}
