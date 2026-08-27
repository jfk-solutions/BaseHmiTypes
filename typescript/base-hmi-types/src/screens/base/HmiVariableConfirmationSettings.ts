import { HmiConfirmationDialogSettings } from "../widgets/HmiConfirmationDialogSettings.js";
import { HmiElectronicSignatureSettings } from "./HmiElectronicSignatureSettings.js";

export class HmiVariableConfirmationSettings {
  enabled?: boolean;
  selector?: string;
  confirmationValue?: number;
  firstSignatureValue?: number;
  secondSignatureValue?: number;
  confirmationDialog?: HmiConfirmationDialogSettings;
  firstSignature?: HmiElectronicSignatureSettings;
  secondSignature?: HmiElectronicSignatureSettings;
}
