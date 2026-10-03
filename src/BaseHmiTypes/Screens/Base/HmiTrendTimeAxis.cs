namespace BaseHmiTypes.Screens.Base;

/// <summary>A named time axis configured independently of trend pens.</summary>
public sealed class HmiTrendTimeAxis
{
    public string? Name { get; set; }
    public HmiProperty<bool>? Visible { get; set; }
    public HmiProperty<bool>? ShowDate { get; set; }
    public HmiProperty<string>? DateFormat { get; set; }
    public HmiProperty<HmiColor>? Color { get; set; }
    public HmiProperty<bool>? InTrendColor { get; set; }
    public HmiProperty<HmiVerticalAlignment>? Alignment { get; set; }
    public string? Label { get; set; }
    public HmiProperty<HmiTrendTimeFormat>? TimeFormat { get; set; }
    public HmiProperty<bool>? DisplayMilliseconds { get; set; }
    public HmiProperty<double>? TimeSpan { get; set; }
    public string? TimeSpanUnit { get; set; }
}
