import { HmiCustomWidgetContainer } from "./HmiCustomWidgetContainer.js";
import { HmiDynamicSvgProperty } from "./HmiDynamicSvgProperty.js";
import { HmiDynamicSvgType } from "./HmiDynamicSvgType.js";
import { HmiImageSource } from "./HmiImageSource.js";
import { HmiProperty } from "./HmiProperty.js";
import { HmiObjectType } from "./HmiObjectType.js";

export class HmiDynamicSvg extends HmiCustomWidgetContainer {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiDynamicSvg;
  }

  svgType?: HmiProperty<HmiDynamicSvgType>;
  image?: HmiProperty<HmiImageSource>;
  readonly properties: HmiDynamicSvgProperty[] = [];
}
