import { IHmiObject } from "../IHmiObject.js";
import { HmiConnection } from "./HmiConnection.js";

export class HmiConnectionList implements IHmiObject {
  lastModified?: Date;
  name?: string;
  readonly connections: HmiConnection[] = [];
}
