import { HmiScreen } from "./HmiScreen.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";

/** Character-oriented screen with ordered entries and optional physical grid dimensions. */
export class HmiCharacterScreen extends HmiScreen {
  columns?: number;
  rows?: number;
  readonly entries: HmiCharacterScreenEntry[] = [];
}
export class HmiCharacterScreenEntry {
  id = "";
  /** Significant spaces, LF line breaks, and U+FFFC for unresolved fields. */
  text = new HmiMultilingualText();
}
