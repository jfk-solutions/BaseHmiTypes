using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiGauge : HmiScaleWidgetBase
{
    public HmiGauge()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiGauge;
    }

    public HmiProperty<double>? NeedleWidth { get; set; }

    public HmiProperty<string>? GaugeStyle { get; set; }

    public HmiProperty<string>? ValueIndicatorSize { get; set; }

    public HmiProperty<HmiColor>? ValueIndicatorColor { get; set; }

    public HmiProperty<bool>? AlarmIndicatorVisible { get; set; }

    public HmiProperty<string>? AlarmIndicatorSize { get; set; }

    public HmiProperty<HmiGaugeSweepStyle>? SweepStyle { get; set; }

    public HmiProperty<string>? EngineeringUnit { get; set; }

    public HmiProperty<bool>? CurrentValueVisible { get; set; }

    public HmiProperty<int>? CurrentValueFieldLength { get; set; }

    public HmiProperty<int>? CurrentValueDecimalPlaces { get; set; }

    public HmiProperty<HmiColor>? CurrentValueColor { get; set; }

    public HmiFont? CurrentValueFont { get; set; }

    public HmiProperty<bool>? EngineeringUnitVisible { get; set; }

    public HmiProperty<bool>? UseVariableEngineeringUnit { get; set; }

    public HmiProperty<HmiColor>? EngineeringUnitColor { get; set; }

    public HmiFont? EngineeringUnitFont { get; set; }

    public HmiProperty<double>? TargetValue { get; set; }

    public HmiProperty<bool>? TargetEnabled { get; set; }

    public HmiProperty<bool>? UseVariableTarget { get; set; }

    public HmiProperty<HmiColor>? TargetColor { get; set; }

    public HmiProperty<HmiColor>? ExpectedRangeColor { get; set; }

    public HmiProperty<double>? TargetHighDeviation { get; set; }

    public HmiProperty<double>? TargetLowDeviation { get; set; }

    public HmiProperty<double>? SetpointValue { get; set; }

    public HmiProperty<bool>? SetpointEnabled { get; set; }

    public HmiProperty<double>? ThresholdHighHigh { get; set; }

    public HmiProperty<double>? ThresholdHigh { get; set; }

    public HmiProperty<double>? ThresholdLow { get; set; }

    public HmiProperty<double>? ThresholdLowLow { get; set; }

    public HmiProperty<HmiColor>? NormalOperatingRangeColor { get; set; }

    public HmiProperty<bool>? UseVariableThresholds { get; set; }

    public HmiGaugeThresholdPresentation? HighHighThresholdPresentation { get; set; }

    public HmiGaugeThresholdPresentation? HighThresholdPresentation { get; set; }

    public HmiGaugeThresholdPresentation? LowThresholdPresentation { get; set; }

    public HmiGaugeThresholdPresentation? LowLowThresholdPresentation { get; set; }

    public HmiProperty<double>? ControlLimitHighHigh { get; set; }

    public HmiProperty<double>? ControlLimitHigh { get; set; }

    public HmiProperty<double>? ControlLimitLow { get; set; }

    public HmiProperty<double>? ControlLimitLowLow { get; set; }

    public HmiProperty<bool>? UseVariableControlLimits { get; set; }

    public HmiProperty<bool>? ControlLimitHighHighEnabled { get; set; }

    public HmiProperty<bool>? ControlLimitHighEnabled { get; set; }

    public HmiProperty<bool>? ControlLimitLowEnabled { get; set; }

    public HmiProperty<bool>? ControlLimitLowLowEnabled { get; set; }

    public HmiProperty<string>? ControlLimitIconSize { get; set; }

    public HmiProperty<HmiColor>? WithinControlLimitColor { get; set; }

    public HmiProperty<HmiColor>? BeyondControlLimitColor { get; set; }

    public HmiProperty<bool>? SparklineEnabled { get; set; }

    public HmiProperty<double>? GaugeBarSize { get; set; }

    public HmiProperty<double>? SparklineLineWidth { get; set; }

    public HmiProperty<double>? SparklineDurationSeconds { get; set; }

    public HmiProperty<HmiLineStyle>? SparklineGridLineStyle { get; set; }

    public HmiProperty<int>? SparklineGridLineCount { get; set; }

    public HmiProperty<HmiColor>? SparklineGridLineColor { get; set; }

    public HmiProperty<bool>? SparklineThresholdLinesVisible { get; set; }

}

public class HmiGaugeThresholdPresentation
{
    public HmiProperty<bool>? Enabled { get; set; }

    public HmiProperty<HmiColor>? InactiveColor { get; set; }

    public HmiProperty<HmiColor>? ActiveColor { get; set; }

    public HmiProperty<bool>? Blink { get; set; }
}
