import { HmiPaintedScreenItemBase } from "./HmiPaintedScreenItemBase.js";
import { HmiScreenItemBase } from "./HmiScreenItemBase.js";
import { HmiChildCoordinateSpace } from "./HmiChildCoordinateSpace.js";

export abstract class HmiLayoutContainerBase extends HmiPaintedScreenItemBase {
  childCoordinateSpace = HmiChildCoordinateSpace.ParentRelative;
  readonly items: HmiScreenItemBase[] = [];
}
