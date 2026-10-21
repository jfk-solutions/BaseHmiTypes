import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base.js";

/** Stored toolbar configuration; commands are not inferred from source identities. */
export class HmiTrendToolbarButton {
  /** Native toolbar command ID, distinct from an opaque source type. */
  controlId?: number;
  sourceType?: string;
  visible?: HmiProperty<boolean>;
  enabled?: HmiProperty<boolean>;
  order?: HmiProperty<number>;
  tooltip?: HmiMultilingualText;
}
