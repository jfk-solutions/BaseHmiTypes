import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiScreenModelBase } from "./HmiScreenModelBase.js";
import { HmiProperty, staticProperty } from "./HmiProperty.js";
import { HmiEventBinding } from "../../scripts/HmiEventBinding.js";
import { HmiElectronicSignatureSettings } from "./HmiElectronicSignatureSettings.js";
import { HmiScriptExposureMode } from "./HmiScriptExposureMode.js";
import { HmiReferenceObjectSettings } from "./HmiReferenceObjectSettings.js";
import { HmiVariableConfirmationSettings } from "./HmiVariableConfirmationSettings.js";
import { HmiAffineTransform } from "./HmiAffineTransform.js";
import { HmiTouchAreaShape } from "./HmiTouchAreaShape.js";
import { HmiConfirmationDialogSettings } from "../widgets/HmiConfirmationDialogSettings.js";
import { HmiRangeAnimation } from "./HmiRangeAnimation.js";
import { HmiSliderAnimation } from "./HmiSliderAnimation.js";
import { HmiScreenParameter } from "./HmiScreenParameter.js";
import { HmiObjectConnection } from "./HmiObjectConnection.js";

export abstract class HmiScreenItemBase extends HmiScreenModelBase {
  description?: string;
  isWallpaper?: boolean;
  isReferenceObject?: boolean;
  referenceObject?: HmiReferenceObjectSettings;
  /** Global-object parameter definitions declared by this base object. */
  readonly parameters: HmiScreenParameter[] = [];
  /** Source connections assigned directly to this object. */
  readonly connections: HmiObjectConnection[] = [];
  scriptExposureMode?: HmiScriptExposureMode;
  sourceFormat?: string;
  sourceData?: Uint8Array;
  readonly sourceProperties: Record<string, string> = {};
  x: HmiProperty<number> = staticProperty(0);
  y: HmiProperty<number> = staticProperty(0);
  width: HmiProperty<number> = staticProperty(0);
  height: HmiProperty<number> = staticProperty(0);
  visible: HmiProperty<boolean> = staticProperty(true);
  enabled: HmiProperty<boolean> = staticProperty(true);
  /** Source polarity for an optional enabled-state expression. */
  enabledWhenExpressionIsTrue?: boolean;
  opacity?: HmiProperty<number>;
  rotationAngle?: HmiProperty<number>;
  rotationCenterX?: HmiProperty<number>;
  rotationCenterY?: HmiProperty<number>;
  horizontalPositionAnimation?: HmiRangeAnimation;
  verticalPositionAnimation?: HmiRangeAnimation;
  widthAnimation?: HmiRangeAnimation;
  heightAnimation?: HmiRangeAnimation;
  rotationAnimation?: HmiRangeAnimation;
  horizontalSliderAnimation?: HmiSliderAnimation;
  verticalSliderAnimation?: HmiSliderAnimation;
  transform?: HmiAffineTransform;
  tabIndex?: HmiProperty<number>;
  securityCode?: string;
  keyNavigation?: HmiProperty<boolean>;
  toolTipText?: HmiProperty<HmiMultilingualText>;
  canBeGrouped?: HmiProperty<boolean>;
  electronicSignature?: HmiElectronicSignatureSettings;
  variableConfirmation?: HmiVariableConfirmationSettings;
  touchAreaShape?: HmiTouchAreaShape;
  touchConfirmationDialog?: HmiConfirmationDialogSettings;
  readonly events: HmiEventBinding[] = [];
}
