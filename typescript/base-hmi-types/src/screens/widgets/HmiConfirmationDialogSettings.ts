import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiFont } from "../base/HmiFont.js";
import { HmiConfirmationButtons } from "./HmiConfirmationButtons.js";

export class HmiConfirmationDialogSettings {
  enabled?: boolean;
  buttons?: HmiConfirmationButtons;
  titleBarVisible?: boolean;
  title?: HmiMultilingualText;
  windowPosition?: string;
  message?: HmiMultilingualText;
  messageFont?: HmiFont;
  imageReference?: string;
}
