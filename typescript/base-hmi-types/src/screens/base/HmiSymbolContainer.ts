import { HmiCustomWidgetContainer } from "./HmiCustomWidgetContainer.js";
import { HmiImageSource } from "./HmiImageSource.js";
import { HmiProperty } from "./HmiProperty.js";
import { HmiSymbolFillColorMode } from "./HmiSymbolFillColorMode.js";
import { HmiSymbolFlipMode } from "./HmiSymbolFlipMode.js";
import { HmiObjectType } from "./HmiObjectType.js";

export class HmiSymbolContainer extends HmiCustomWidgetContainer {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiSymbolContainer;
  }

  fillColorMode?: HmiProperty<HmiSymbolFillColorMode>;
  flip?: HmiProperty<HmiSymbolFlipMode>;
  fixedAspectRatio?: HmiProperty<boolean>;
  image?: HmiProperty<HmiImageSource>;
}
