import { HmiLayer } from "./HmiLayer.js";
import { HmiProperty, staticProperty } from "./HmiProperty.js";
import { HmiScreenModelBase } from "./HmiScreenModelBase.js";

export abstract class HmiScreenBase extends HmiScreenModelBase {
  width: HmiProperty<number> = staticProperty(0);
  height: HmiProperty<number> = staticProperty(0);
  readonly layers: HmiLayer[] = [];
}
