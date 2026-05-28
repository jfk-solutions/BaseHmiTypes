import { HmiProperty, staticProperty } from "./HmiProperty.js";

export class HmiThickness {
  left: HmiProperty<number> = staticProperty(0);
  top: HmiProperty<number> = staticProperty(0);
  right: HmiProperty<number> = staticProperty(0);
  bottom: HmiProperty<number> = staticProperty(0);
}
