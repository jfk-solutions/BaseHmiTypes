import { HmiColor, HmiLineStyle, hmiColorFromArgb } from "../base.js";
import { HmiDefaultProfile } from "./HmiDefaultProfile.js";

const advancedFillStyleSolid = 0;
const advancedLineStyleNone = HmiLineStyle.None;
const advancedLineStyleSolid = HmiLineStyle.Solid;
const advancedSwitchTypeSwitch = 0;
const advancedWinCcStyleGlobalDesign = 1;
const advancedSymbolicIoFieldTypeInOutput = 2;
const advancedClockNumberStyleNoNumber = 0;

export class HmiDefaultProfiles {
  static readonly empty = new HmiDefaultProfile("Empty");
  static readonly neutral = new HmiDefaultProfile("Neutral");
  static readonly winCcAdvancedV21 = createWinCcAdvancedV21();
  static readonly winCcUnifiedV21 = createWinCcUnifiedV21();
}

function createWinCcAdvancedV21(): HmiDefaultProfile {
  const profile = new HmiDefaultProfile("WinCcAdvancedV21");

  profile.set("HmiPaintedScreenItemBase", "BorderWidth", 1);
  profile.set("HmiShapeBase", "BackFillPattern", advancedFillStyleSolid);
  profile.set("HmiShapeBase", "UseDesignColorSchema", true);
  profile.set("HmiShapeBase", "UseTransparentColor", false);
  profile.set("HmiShapeBase", "UseFirstGradient", false);
  profile.set("HmiShapeBase", "UseSecondGradient", false);
  profile.set("HmiSurfaceShapeBase", "EdgeStyle", advancedLineStyleSolid);

  profile.set("HmiWidgetBase", "BackFillPattern", advancedFillStyleSolid);
  profile.set("HmiWidgetBase", "EdgeStyle", advancedLineStyleSolid);
  profile.set("HmiWidgetBase", "UseDesignColorSchema", true);
  profile.set("HmiWidgetBase", "UseFirstGradient", false);
  profile.set("HmiWidgetBase", "UseSecondGradient", false);
  profile.set("HmiWidgetBase", "FocusWidth", 1);

  profile.set("HmiScaleWidgetBase", "ShowFillLevel", false);
  profile.set("HmiScaleWidgetBase", "ShowScale", true);
  profile.set("HmiScaleWidgetBase", "DrawInsideFrame", true);
  profile.set("HmiScaleWidgetBase", "ShowTickLabels", true);
  profile.set("HmiScaleWidgetBase", "UseAutoScaling", true);
  profile.set("HmiScaleWidgetBase", "ShowLimitRanges", false);

  profile.set("HmiButton", "StyleSettings", advancedWinCcStyleGlobalDesign);
  profile.set("HmiButton", "WindowsStyle", true);
  profile.set("HmiToggleSwitch", "Mode", advancedSwitchTypeSwitch);

  profile.set("HmiSymbolicIOField", "Mode", advancedSymbolicIoFieldTypeInOutput);
  profile.set("HmiSymbolicIOField", "ShowDropDownButton", true);
  profile.set("HmiSymbolicIOField", "ShowDropDownList", true);

  profile.set("HmiClock", "Analog", true);
  profile.set("HmiClock", "NumberStyle", advancedClockNumberStyleNoNumber);
  profile.set("HmiClock", "ShowDate", true);

  profile.set("HmiGraphicView", "EdgeStyle", advancedLineStyleNone);
  profile.set("HmiDynamicSvg", "UseDesignColorSchema", true);
  profile.set("HmiDynamicSvg", "UseTransparentColor", true);

  return profile;
}

function createWinCcUnifiedV21(): HmiDefaultProfile {
  const profile = new HmiDefaultProfile("WinCcUnifiedV21");

  setPainted(profile, "HmiCircle", undefined, 4291349975, 4286414213);
  setPainted(profile, "HmiCircleSegment", undefined, 4291349975, 4286414213);
  setLine(profile, "HmiCircularArc", 4286414213);
  setPainted(profile, "HmiEllipse", undefined, 4291349975, 4286414213);
  setPainted(profile, "HmiEllipseSegment", undefined, 4291349975, 4286414213);
  setLine(profile, "HmiEllipticalArc", 4286414213);
  setPainted(profile, "HmiGraphicView", undefined, 0, undefined, 0);
  setLine(profile, "HmiLine", 4286414213);
  setPainted(profile, "HmiPolygon", undefined, 4291349975, 4286414213);
  setLine(profile, "HmiPolyline", 4286414213);
  setPainted(profile, "HmiRectangle", undefined, 4291349975, 4286414213);
  setPainted(profile, "HmiText", 4280363308);

  setPainted(profile, "HmiBar", undefined, 16777215, 0);
  setPainted(profile, "HmiButton", 4294967295, 4286288546, 0, 2);
  setPainted(profile, "HmiCheckBoxGroup", undefined, 16777215, 4278190080, 0);
  setPainted(profile, "HmiClock", undefined, 16777215, 0);
  setPainted(profile, "HmiGauge", undefined, 16777215, 4278190080, 0);
  setPainted(profile, "HmiIOField", 4280363308, 4294967295, 4286683046, 2);
  setPainted(profile, "HmiLabel", 4280363308, 15922431, 4284769386, 0);
  setPainted(profile, "HmiListBox", 4280363308, 4294967295, 4288393150);
  setPainted(profile, "HmiRadioButtonGroup", undefined, 16777215, 0);
  setPainted(profile, "HmiSlider", undefined, 16777215, 0);
  setPainted(profile, "HmiSymbolicIOField", 4280363308, 4294967295, 4286288546, 2);
  setPainted(profile, "HmiTextBox", 4280363308, 15922431, 4284769386, 0);
  setPainted(profile, "HmiToggleSwitch", 4280363308, 4291680737, 0, 0);

  return profile;
}

function setPainted(
  profile: HmiDefaultProfile,
  objectType: string,
  foregroundColor?: number,
  backgroundColor?: number,
  borderColor?: number,
  borderWidth?: number,
): void {
  if (foregroundColor !== undefined) {
    profile.set<HmiColor>(objectType, "ForegroundColor", fromUnifiedColor(foregroundColor));
  }
  if (backgroundColor !== undefined) {
    profile.set<HmiColor>(objectType, "BackgroundColor", fromUnifiedColor(backgroundColor));
  }
  if (borderColor !== undefined) {
    profile.set<HmiColor>(objectType, "BorderColor", fromUnifiedColor(borderColor));
  }
  if (borderWidth !== undefined) {
    profile.set(objectType, "BorderWidth", borderWidth);
  }
}

function setLine(profile: HmiDefaultProfile, objectType: string, lineColor: number): void {
  profile.set<HmiColor>(objectType, "LineColor", fromUnifiedColor(lineColor));
}

function fromUnifiedColor(value: number): HmiColor {
  const alpha = value <= 0xffffff ? 255 : value >>> 24;
  return hmiColorFromArgb(alpha, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff);
}
