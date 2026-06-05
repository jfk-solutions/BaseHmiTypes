import { HmiCustomWidgetContainer } from "./HmiCustomWidgetContainer.js";
import { HmiDynamicSvgProperty } from "./HmiDynamicSvgProperty.js";
import { HmiDynamicSvgType } from "./HmiDynamicSvgType.js";
import { HmiImageSource } from "./HmiImageSource.js";
import { HmiProperty } from "./HmiProperty.js";

export class HmiDynamicSvg extends HmiCustomWidgetContainer {
  svgType?: HmiProperty<HmiDynamicSvgType>;
  image?: HmiProperty<HmiImageSource>;
  readonly properties: HmiDynamicSvgProperty[] = [];
}
