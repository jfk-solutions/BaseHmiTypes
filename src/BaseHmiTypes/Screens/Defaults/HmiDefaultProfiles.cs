using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;

namespace BaseHmiTypes.Screens.Defaults;

public static class HmiDefaultProfiles
{
    private const int AdvancedFillStyleSolid = 0;
    private const HmiLineStyle AdvancedLineStyleNone = HmiLineStyle.None;
    private const HmiLineStyle AdvancedLineStyleSolid = HmiLineStyle.Solid;
    private const HmiSwitchType AdvancedSwitchTypeSwitch = HmiSwitchType.Switch;
    private const int AdvancedWinCcStyleGlobalDesign = 1;
    private const int AdvancedSymbolicIoFieldTypeInOutput = 2;
    private const int AdvancedClockNumberStyleNoNumber = 0;

    public static HmiDefaultProfile Empty { get; } = new(nameof(Empty));

    public static HmiDefaultProfile Neutral { get; } = new(nameof(Neutral));

    public static HmiDefaultProfile WinCcAdvancedV21 { get; } = CreateWinCcAdvancedV21();

    public static HmiDefaultProfile WinCcUnifiedV21 { get; } = CreateWinCcUnifiedV21();

    private static HmiDefaultProfile CreateWinCcAdvancedV21()
    {
        var profile = new HmiDefaultProfile(nameof(WinCcAdvancedV21));

        // Values are from TIA V21 GraphX GetPropertyValueWithDefault/GetScreenItemPropertyOrDefault
        // fallbacks and GraphXScreen DefaultValue attributes. Enum numeric values were checked in IL.
        profile.Set<HmiPaintedScreenItemBase, double>(nameof(HmiPaintedScreenItemBase.BorderWidth), 1d);
        profile.Set<HmiShapeBase, int>(nameof(HmiShapeBase.BackFillPattern), AdvancedFillStyleSolid);
        profile.Set<HmiShapeBase, bool>(nameof(HmiShapeBase.UseDesignColorSchema), true);
        profile.Set<HmiShapeBase, bool>(nameof(HmiShapeBase.UseTransparentColor), false);
        profile.Set<HmiShapeBase, bool>(nameof(HmiShapeBase.UseFirstGradient), false);
        profile.Set<HmiShapeBase, bool>(nameof(HmiShapeBase.UseSecondGradient), false);
        profile.Set<HmiSurfaceShapeBase, HmiLineStyle>(nameof(HmiSurfaceShapeBase.EdgeStyle), AdvancedLineStyleSolid);

        profile.Set<HmiWidgetBase, int>(nameof(HmiWidgetBase.BackFillPattern), AdvancedFillStyleSolid);
        profile.Set<HmiWidgetBase, HmiLineStyle>(nameof(HmiWidgetBase.EdgeStyle), AdvancedLineStyleSolid);
        profile.Set<HmiWidgetBase, bool>(nameof(HmiWidgetBase.UseDesignColorSchema), true);
        profile.Set<HmiWidgetBase, bool>(nameof(HmiWidgetBase.UseFirstGradient), false);
        profile.Set<HmiWidgetBase, bool>(nameof(HmiWidgetBase.UseSecondGradient), false);
        profile.Set<HmiWidgetBase, double>(nameof(HmiWidgetBase.FocusWidth), 1d);

        profile.Set<HmiScaleWidgetBase, bool>(nameof(HmiScaleWidgetBase.ShowFillLevel), false);
        profile.Set<HmiScaleWidgetBase, bool>(nameof(HmiScaleWidgetBase.ShowScale), true);
        profile.Set<HmiScaleWidgetBase, bool>(nameof(HmiScaleWidgetBase.DrawInsideFrame), true);
        profile.Set<HmiScaleWidgetBase, bool>(nameof(HmiScaleWidgetBase.ShowTickLabels), true);
        profile.Set<HmiScaleWidgetBase, bool>(nameof(HmiScaleWidgetBase.UseAutoScaling), true);
        profile.Set<HmiScaleWidgetBase, bool>(nameof(HmiScaleWidgetBase.ShowLimitRanges), false);

        profile.Set<HmiButtonBase, int>(nameof(HmiButtonBase.StyleSettings), AdvancedWinCcStyleGlobalDesign);
        profile.Set<HmiButtonBase, bool>(nameof(HmiButtonBase.WindowsStyle), true);
        profile.Set<HmiToggleSwitch, HmiSwitchType>(nameof(HmiToggleSwitch.Mode), AdvancedSwitchTypeSwitch);

        profile.Set<HmiSymbolicIOField, int>(nameof(HmiSymbolicIOField.Mode), AdvancedSymbolicIoFieldTypeInOutput);
        profile.Set<HmiSymbolicIOField, bool>(nameof(HmiSymbolicIOField.ShowDropDownButton), true);
        profile.Set<HmiSymbolicIOField, bool>(nameof(HmiSymbolicIOField.ShowDropDownList), true);

        profile.Set<HmiClock, bool>(nameof(HmiClock.Analog), true);
        profile.Set<HmiClock, int>(nameof(HmiClock.NumberStyle), AdvancedClockNumberStyleNoNumber);
        profile.Set<HmiClock, bool>(nameof(HmiClock.ShowDate), true);

        profile.Set<HmiGraphicView, HmiLineStyle>(nameof(HmiSurfaceShapeBase.EdgeStyle), AdvancedLineStyleNone);
        profile.Set<HmiDynamicSvg, bool>(nameof(HmiDynamicSvg.UseDesignColorSchema), true);
        profile.Set<HmiDynamicSvg, bool>(nameof(HmiDynamicSvg.UseTransparentColor), true);

        return profile;
    }

    private static HmiDefaultProfile CreateWinCcUnifiedV21()
    {
        var profile = new HmiDefaultProfile(nameof(WinCcUnifiedV21));

        // Siemens V21 ships these values in Data/Hmi/Transfer/VoT/styles/FlatStyle_Bright.json.
        // They are Unified style defaults, not Advanced GraphX storage defaults.
        SetPainted<HmiCircle>(profile, backgroundColor: 4291349975u, borderColor: 4286414213u);
        SetPainted<HmiCircleSegment>(profile, backgroundColor: 4291349975u, borderColor: 4286414213u);
        SetLine<HmiCircularArc>(profile, lineColor: 4286414213u);
        SetPainted<HmiEllipse>(profile, backgroundColor: 4291349975u, borderColor: 4286414213u);
        SetPainted<HmiEllipseSegment>(profile, backgroundColor: 4291349975u, borderColor: 4286414213u);
        SetLine<HmiEllipticalArc>(profile, lineColor: 4286414213u);
        SetPainted<HmiGraphicView>(profile, backgroundColor: 0u, borderWidth: 0d);
        SetLine<HmiLine>(profile, lineColor: 4286414213u);
        SetPainted<HmiPolygon>(profile, backgroundColor: 4291349975u, borderColor: 4286414213u);
        SetLine<HmiPolyline>(profile, lineColor: 4286414213u);
        SetPainted<HmiRectangle>(profile, backgroundColor: 4291349975u, borderColor: 4286414213u);
        SetPainted<HmiText>(profile, foregroundColor: 4280363308u);

        SetPainted<HmiBar>(profile, backgroundColor: 16777215u, borderColor: 0u);
        SetPainted<HmiButton>(profile, foregroundColor: 4294967295u, backgroundColor: 4286288546u, borderColor: 0u, borderWidth: 2d);
        SetPainted<HmiCheckBoxGroup>(profile, backgroundColor: 16777215u, borderColor: 4278190080u, borderWidth: 0d);
        SetPainted<HmiClock>(profile, backgroundColor: 16777215u, borderColor: 0u);
        SetPainted<HmiGauge>(profile, backgroundColor: 16777215u, borderColor: 4278190080u, borderWidth: 0d);
        SetPainted<HmiIOField>(profile, foregroundColor: 4280363308u, backgroundColor: 4294967295u, borderColor: 4286683046u, borderWidth: 2d);
        SetPainted<HmiLabel>(profile, foregroundColor: 4280363308u, backgroundColor: 15922431u, borderColor: 4284769386u, borderWidth: 0d);
        SetPainted<HmiListBox>(profile, foregroundColor: 4280363308u, backgroundColor: 4294967295u, borderColor: 4288393150u);
        SetPainted<HmiRadioButtonGroup>(profile, backgroundColor: 16777215u, borderColor: 0u);
        SetPainted<HmiSlider>(profile, backgroundColor: 16777215u, borderColor: 0u);
        SetPainted<HmiSymbolicIOField>(profile, foregroundColor: 4280363308u, backgroundColor: 4294967295u, borderColor: 4286288546u, borderWidth: 2d);
        SetPainted<HmiTextBox>(profile, foregroundColor: 4280363308u, backgroundColor: 15922431u, borderColor: 4284769386u, borderWidth: 0d);
        SetPainted<HmiToggleSwitch>(profile, foregroundColor: 4280363308u, backgroundColor: 4291680737u, borderColor: 0u, borderWidth: 0d);

        SetCenteredTextAlignment<HmiText>(profile);
        SetCenteredTextAlignment<HmiWidgetBase>(profile);

        return profile;
    }

    private static void SetPainted<TItem>(
        HmiDefaultProfile profile,
        uint? foregroundColor = null,
        uint? backgroundColor = null,
        uint? borderColor = null,
        double? borderWidth = null)
        where TItem : HmiPaintedScreenItemBase
    {
        if (foregroundColor.HasValue)
            profile.Set<TItem, HmiColor>(nameof(HmiPaintedScreenItemBase.ForegroundColor), FromUnifiedColor(foregroundColor.Value));
        if (backgroundColor.HasValue)
            profile.Set<TItem, HmiColor>(nameof(HmiPaintedScreenItemBase.BackgroundColor), FromUnifiedColor(backgroundColor.Value));
        if (borderColor.HasValue)
            profile.Set<TItem, HmiColor>(nameof(HmiPaintedScreenItemBase.BorderColor), FromUnifiedColor(borderColor.Value));
        if (borderWidth.HasValue)
            profile.Set<TItem, double>(nameof(HmiPaintedScreenItemBase.BorderWidth), borderWidth.Value);
    }

    private static void SetLine<TItem>(HmiDefaultProfile profile, uint lineColor)
        where TItem : HmiShapeBase
    {
        profile.Set<TItem, HmiColor>(nameof(HmiShapeBase.LineColor), FromUnifiedColor(lineColor));
    }

    private static void SetCenteredTextAlignment<TItem>(HmiDefaultProfile profile)
        where TItem : HmiScreenItemBase
    {
        profile.Set<TItem, HmiHorizontalAlignment>("HorizontalAlignment", HmiHorizontalAlignment.Center);
        profile.Set<TItem, HmiVerticalAlignment>("VerticalAlignment", HmiVerticalAlignment.Center);
    }

    private static HmiColor FromUnifiedColor(uint value)
    {
        var alpha = value <= 0xFFFFFFu ? (byte)255 : (byte)(value >> 24);
        return HmiColor.FromArgb(
            alpha,
            (byte)(value >> 16),
            (byte)(value >> 8),
            (byte)value);
    }
}
