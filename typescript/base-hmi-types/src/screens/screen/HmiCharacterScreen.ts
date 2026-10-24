import { HmiScreen } from "./HmiScreen.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiEventBinding } from "../../scripts/HmiEventBinding.js";

/** Character-oriented screen with ordered entries and optional physical grid dimensions. */
export class HmiCharacterScreen extends HmiScreen {
  columns?: number;
  rows?: number;
  readonly entries: HmiCharacterScreenEntry[] = [];
  /** Imported field actions; hosts own field observation and dispatch. */
  readonly fieldEvents: HmiEventBinding[] = [];
}
export class HmiCharacterScreenEntry {
  id = "";
  /** Significant spaces, LF line breaks, and U+FFFC for unresolved fields. */
  text = new HmiMultilingualText();
}
