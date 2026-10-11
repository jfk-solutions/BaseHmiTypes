import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiColor } from "../base/HmiColor.js";

import { HmiHorizontalAlignment } from "../base/HmiHorizontalAlignment.js";
import { HmiVerticalAlignment } from "../base/HmiVerticalAlignment.js";

export class HmiParameterColumn {
  name?: string;
  key?: string;
  headerText?: HmiMultilingualText;
  headerGraphic?: import("../base/HmiImageSource.js").HmiImageSource;
  headerGraphicKey?: string;
  /** Unified: 0 graphic or text, 1 graphic and text, 2 text, 3 graphic. */
  headerContentMode?: HmiProperty<number>;
  headerContentSpacing?: HmiProperty<number>;
  headerGraphicStretchMode?: HmiProperty<number>;
  headerTextTrimming?: HmiProperty<number>;
  contentTextTrimming?: HmiProperty<number>;
  headerHorizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  headerVerticalAlignment?: HmiProperty<HmiVerticalAlignment>;
  visible?: HmiProperty<boolean>;
  enabled?: HmiProperty<boolean>;
  backgroundColor?: HmiProperty<HmiColor>;
  foregroundColor?: HmiProperty<HmiColor>;
  width?: HmiProperty<number>;
  minimumWidth?: HmiProperty<number>;
  maximumWidth?: HmiProperty<number>;
  allowSort?: HmiProperty<boolean>;
  sortOrder?: HmiProperty<number>;
  sortDirection?: HmiProperty<number>;
  outputFormat?: HmiProperty<string>;
}
