import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base.js";

/** Configured status-panel content; runtime values are not inferred from its identity. */
export class HmiTrendStatusBarPanel {
  sourceType?: string;
  visible?: HmiProperty<boolean>;
  order?: HmiProperty<number>;
  text?: HmiMultilingualText;
  tooltip?: HmiMultilingualText;
  width?: HmiProperty<number>;
  autoSize?: HmiProperty<boolean>;
}
