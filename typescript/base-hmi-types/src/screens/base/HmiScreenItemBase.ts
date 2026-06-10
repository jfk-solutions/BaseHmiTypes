import { HmiScreenModelBase } from "./HmiScreenModelBase.js";
import { HmiProperty, staticProperty } from "./HmiProperty.js";
import { HmiEventBinding } from "../../scripts/HmiEventBinding.js";

export abstract class HmiScreenItemBase extends HmiScreenModelBase {
  x: HmiProperty<number> = staticProperty(0);
  y: HmiProperty<number> = staticProperty(0);
  width: HmiProperty<number> = staticProperty(0);
  height: HmiProperty<number> = staticProperty(0);
  visible: HmiProperty<boolean> = staticProperty(true);
  enabled: HmiProperty<boolean> = staticProperty(true);
  opacity?: HmiProperty<number>;
  rotationAngle?: HmiProperty<number>;
  rotationCenterX?: HmiProperty<number>;
  rotationCenterY?: HmiProperty<number>;
  tabIndex?: HmiProperty<number>;
  toolTipText?: HmiProperty<string>;
  canBeGrouped?: HmiProperty<boolean>;
  readonly events: HmiEventBinding[] = [];
}
