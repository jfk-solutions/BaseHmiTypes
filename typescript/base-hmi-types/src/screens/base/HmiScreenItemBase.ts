import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiScreenModelBase } from "./HmiScreenModelBase.js";
import { HmiProperty, staticProperty } from "./HmiProperty.js";
import { HmiEventBinding } from "../../scripts/HmiEventBinding.js";
import { HmiElectronicSignatureSettings } from "./HmiElectronicSignatureSettings.js";
import { HmiScriptExposureMode } from "./HmiScriptExposureMode.js";
import { HmiReferenceObjectSettings } from "./HmiReferenceObjectSettings.js";

export abstract class HmiScreenItemBase extends HmiScreenModelBase {
  description?: string;
  isWallpaper?: boolean;
  isReferenceObject?: boolean;
  referenceObject?: HmiReferenceObjectSettings;
  scriptExposureMode?: HmiScriptExposureMode;
  x: HmiProperty<number> = staticProperty(0);
  y: HmiProperty<number> = staticProperty(0);
  width: HmiProperty<number> = staticProperty(0);
  height: HmiProperty<number> = staticProperty(0);
  visible: HmiProperty<boolean> = staticProperty(true);
  enabled: HmiProperty<boolean> = staticProperty(true);
  opacity?: HmiProperty<number>;
  rotationAngle?: HmiProperty<number>;
  rotationCenterX?: HmiProperty<number>;
  rotationCenterY?: HmiProperty<number>;
  tabIndex?: HmiProperty<number>;
  securityCode?: string;
  keyNavigation?: HmiProperty<boolean>;
  toolTipText?: HmiProperty<HmiMultilingualText>;
  canBeGrouped?: HmiProperty<boolean>;
  electronicSignature?: HmiElectronicSignatureSettings;
  readonly events: HmiEventBinding[] = [];
}
