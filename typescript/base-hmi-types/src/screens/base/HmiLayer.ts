import { HmiModelBase } from "./HmiModelBase.js";
import { HmiProperty, staticProperty } from "./HmiProperty.js";
import { HmiScreenItemBase } from "./HmiScreenItemBase.js";

export class HmiLayer extends HmiModelBase {
  visible: HmiProperty<boolean> = staticProperty(true);
  runtimeVisible: HmiProperty<boolean> = staticProperty(true);
  locked: HmiProperty<boolean> = staticProperty(false);
  visibilityMinZoom?: HmiProperty<number>;
  visibilityMaxZoom?: HmiProperty<number>;
  readonly items: HmiScreenItemBase[] = [];
}
