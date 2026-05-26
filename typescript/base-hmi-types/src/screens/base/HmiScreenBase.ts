import { HmiLayer } from "./HmiLayer.js";
import { HmiScreenModelBase } from "./HmiScreenModelBase.js";

export abstract class HmiScreenBase extends HmiScreenModelBase {
  readonly layers: HmiLayer[] = [];
}
