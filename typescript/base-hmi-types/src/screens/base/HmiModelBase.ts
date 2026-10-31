import type { HmiMultilingualText } from "../../common/HmiMultilingualText.js";

export abstract class HmiModelBase {
  id?: string;
  name?: string;
  displayName?: HmiMultilingualText;
}
