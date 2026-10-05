using BaseHmiTypes.Common;

namespace BaseHmiTypes.Screens.Base;

/// <summary>A named time axis configured independently of trend pens.</summary>
public sealed class HmiTrendTimeAxis
{
    public string? Name { get; set; }
    public string? TrendWindowName { get; set; }
    public HmiProperty<bool>? Visible { get; set; }
    public HmiProperty<bool>? ShowDate { get; set; }
    public HmiProperty<string>? DateFormat { get; set; }
    public HmiProperty<HmiColor>? Color { get; set; }
    public HmiProperty<bool>? InTrendColor { get; set; }
    public HmiProperty<HmiVerticalAlignment>? Alignment { get; set; }
    public string? Label { get; set; }
    public HmiMultilingualText? LabelText { get; set; }
    public HmiProperty<HmiTrendTimeFormat>? TimeFormat { get; set; }
    public HmiProperty<string>? TimeFormatPattern { get; set; }
    public HmiProperty<bool>? DisplayMilliseconds { get; set; }
    public HmiProperty<int>? TimeRangeBaseCode { get; set; }
    public HmiProperty<double>? TimeRangeFactor { get; set; }
    public HmiProperty<double>? TimeRangeBaseMilliseconds { get; set; }
    public HmiProperty<double>? TimeSpan { get; set; }
    public string? TimeSpanUnit { get; set; }
    public HmiProperty<HmiTrendTimeRangeType>? RangeType { get; set; }
    public HmiProperty<DateTimeOffset>? StartTime { get; set; }
    public HmiProperty<DateTimeOffset>? EndTime { get; set; }
    public HmiProperty<int>? MeasurementPoints { get; set; }
    public HmiProperty<bool>? RefreshEnabled { get; set; }
}
