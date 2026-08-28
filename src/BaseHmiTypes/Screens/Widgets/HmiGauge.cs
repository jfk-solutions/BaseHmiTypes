using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiGauge : HmiScaleWidgetBase
{
    public HmiGauge()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiGauge;
    }

    public HmiProperty<double>? NeedleWidth { get; set; }

    public HmiProperty<HmiGaugeSweepStyle>? SweepStyle { get; set; }

    public HmiProperty<string>? EngineeringUnit { get; set; }

    public HmiProperty<double>? TargetValue { get; set; }

    public HmiProperty<double>? TargetHighDeviation { get; set; }

    public HmiProperty<double>? TargetLowDeviation { get; set; }

    public HmiProperty<double>? SetpointValue { get; set; }

    public HmiProperty<double>? ThresholdHighHigh { get; set; }

    public HmiProperty<double>? ThresholdHigh { get; set; }

    public HmiProperty<double>? ThresholdLow { get; set; }

    public HmiProperty<double>? ThresholdLowLow { get; set; }

    public HmiProperty<double>? ControlLimitHighHigh { get; set; }

    public HmiProperty<double>? ControlLimitHigh { get; set; }

    public HmiProperty<double>? ControlLimitLow { get; set; }

    public HmiProperty<double>? ControlLimitLowLow { get; set; }

    public HmiProperty<bool>? SparklineEnabled { get; set; }

    public HmiProperty<double>? GaugeBarSize { get; set; }

    public HmiProperty<double>? SparklineLineWidth { get; set; }

    public HmiProperty<double>? SparklineDurationSeconds { get; set; }

    public HmiProperty<HmiLineStyle>? SparklineGridLineStyle { get; set; }

    public HmiProperty<int>? SparklineGridLineCount { get; set; }

    public HmiProperty<HmiColor>? SparklineGridLineColor { get; set; }

    public HmiProperty<bool>? SparklineThresholdLinesVisible { get; set; }

}
