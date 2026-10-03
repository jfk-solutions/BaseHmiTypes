namespace BaseHmiTypes.Screens.Base;

/// <summary>A configured trend value axis, independent of whether any pen uses it.</summary>
public sealed class HmiTrendValueAxis
{
    public string? Name { get; set; }
    public string? Label { get; set; }
    public HmiProperty<double>? MinimumValue { get; set; }
    public HmiProperty<double>? MaximumValue { get; set; }
    public HmiProperty<bool>? Visible { get; set; }
    public HmiProperty<int>? DecimalPlaces { get; set; }
    public HmiProperty<bool>? AutoScale { get; set; }
    public HmiProperty<HmiTrendAxisScaleType>? ScaleType { get; set; }
    public HmiProperty<bool>? ExponentialFormat { get; set; }
    public HmiProperty<bool>? AutoDecimalPlaces { get; set; }
    public HmiProperty<HmiColor>? Color { get; set; }
    public HmiProperty<bool>? InTrendColor { get; set; }
    public HmiProperty<HmiHorizontalAlignment>? Alignment { get; set; }
}
