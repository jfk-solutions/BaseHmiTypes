using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public abstract class HmiScaleWidgetBase : HmiWidgetBase
{
    public HmiProperty<double>? Value { get; set; }

    public HmiProperty<double>? FillLevel { get; set; }

    public HmiProperty<bool>? ShowFillLevel { get; set; }

    public HmiProperty<double>? BeginValue { get; set; }

    public HmiProperty<double>? EndValue { get; set; }

    public HmiProperty<double>? OriginValue { get; set; }

    public HmiProperty<int>? DivisionCount { get; set; }

    public HmiProperty<int>? SubDivisionCount { get; set; }

    public HmiProperty<int>? BarMode { get; set; }

    public HmiProperty<int>? ScaleMode { get; set; }

    public HmiProperty<int>? Orientation { get; set; }

    public HmiProperty<bool>? ShowValue { get; set; }

    public HmiProperty<int>? ValuePosition { get; set; }
}
