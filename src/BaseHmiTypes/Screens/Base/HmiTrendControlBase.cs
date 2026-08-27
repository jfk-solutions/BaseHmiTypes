namespace BaseHmiTypes.Screens.Base;

public abstract class HmiTrendControlBase : HmiControlWindowBase
{
    public IList<HmiTrendPen> Pens { get; } = new List<HmiTrendPen>();

    public HmiProperty<double>? MinimumValue { get; set; }

    public HmiProperty<double>? MaximumValue { get; set; }

    public HmiProperty<HmiTrendChartStyle>? ChartStyle { get; set; }

    public HmiProperty<int>? XAxisPenNumber { get; set; }

    public HmiProperty<HmiTrendUpdateMode>? UpdateMode { get; set; }

    public HmiProperty<double>? RefreshRateMilliseconds { get; set; }

    public HmiProperty<double>? HeartbeatMilliseconds { get; set; }

    public HmiProperty<double>? DeadbandPercent { get; set; }

    public HmiProperty<HmiTrendTimeFormat>? TimeFormat { get; set; }

    public HmiProperty<HmiTrendNumericRadix>? NumericRadix { get; set; }

    public HmiProperty<HmiTrendDataPointConnection>? DataPointConnection { get; set; }

    public HmiProperty<bool>? DisplayMilliseconds { get; set; }

    public HmiProperty<bool>? DisplayPenIcons { get; set; }

    public HmiProperty<bool>? AllowScrolling { get; set; }

    public HmiProperty<HmiTrendScrollMode>? ScrollMode { get; set; }

    public HmiProperty<int>? BufferSizePerPen { get; set; }

    public HmiProperty<bool>? XAxisScaleVisible { get; set; }

    public HmiProperty<bool>? XAxisDateVisible { get; set; }

    public HmiProperty<bool>? XAxisGridVisible { get; set; }

    public HmiProperty<int>? XAxisMajorGridLineCount { get; set; }

    public HmiProperty<int>? XAxisMinorGridLineCount { get; set; }

    public HmiProperty<HmiColor>? XAxisGridColor { get; set; }

    /// <summary>
    /// Engineering-system date text used at the left edge when scrolling is disabled.
    /// </summary>
    public string? XAxisStartDate { get; set; }

    /// <summary>
    /// Engineering-system time text used at the left edge when scrolling is disabled.
    /// </summary>
    public string? XAxisStartTime { get; set; }

    public HmiProperty<double>? XAxisTimeSpan { get; set; }

    public string? XAxisTimeSpanUnit { get; set; }

    public HmiProperty<HmiTrendYAxisRangeMode>? YAxisRangeMode { get; set; }

    public HmiProperty<bool>? YAxisIsolatedGraphing { get; set; }

    public HmiProperty<double>? YAxisIsolationPercent { get; set; }

    public HmiProperty<bool>? YAxisScaleVisible { get; set; }

    public HmiProperty<int>? YAxisDecimalPlaces { get; set; }

    public HmiProperty<bool>? YAxisGridVisible { get; set; }

    public HmiProperty<int>? YAxisMajorGridLineCount { get; set; }

    public HmiProperty<int>? YAxisMinorGridLineCount { get; set; }

    public HmiProperty<HmiColor>? YAxisGridColor { get; set; }

    public HmiProperty<HmiTrendYAxisScaleMode>? YAxisScaleMode { get; set; }

    public HmiProperty<int>? YAxisScalePenNumber { get; set; }
}
