namespace BaseHmiTypes.Screens.Base;

/// <summary>A configured numeric X axis of an XY plot, independent of curve assignments.</summary>
public sealed class HmiTrendXValueAxis
{
    public string? Name { get; set; }
    public string? TrendWindowName { get; set; }
    public string? Label { get; set; }
    public HmiProperty<double>? MinimumValue { get; set; }
    public HmiProperty<double>? MaximumValue { get; set; }
    public HmiProperty<bool>? Visible { get; set; }
    /// <summary>Whether the range must be determined from runtime curve values.</summary>
    public HmiProperty<bool>? AutoRange { get; set; }
    public HmiProperty<int>? DivisionCount { get; set; }
    public HmiProperty<int>? DecimalPlaces { get; set; }
    public HmiProperty<HmiTrendAxisScaleType>? ScaleType { get; set; }
    public HmiProperty<bool>? ExponentialFormat { get; set; }
    public HmiProperty<HmiColor>? Color { get; set; }
    public HmiProperty<HmiVerticalAlignment>? Alignment { get; set; }
}
