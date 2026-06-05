import { HmiCustomWidgetContainer } from "./HmiCustomWidgetContainer.js";
import { HmiDynamicSvgProperty } from "./HmiDynamicSvgProperty.js";
import { HmiDynamicSvgType } from "./HmiDynamicSvgType.js";
import { HmiProperty } from "./HmiProperty.js";

export class HmiDynamicSvg extends HmiCustomWidgetContainer {
  svgType?: HmiProperty<HmiDynamicSvgType>;
  resourceId?: HmiProperty<string>;
  resourceName?: HmiProperty<string>;
  controlType?: HmiProperty<string>;
  displayName?: HmiProperty<string>;
  fileName?: HmiProperty<string>;
  filePath?: HmiProperty<string>;
  hashCode?: HmiProperty<string>;
  version?: HmiProperty<string>;
  defaultWidth?: HmiProperty<number>;
  defaultHeight?: HmiProperty<number>;
  readonly properties: HmiDynamicSvgProperty[] = [];
}
