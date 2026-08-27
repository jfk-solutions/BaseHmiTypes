namespace BaseHmiTypes.Screens.Base;

public abstract class HmiTrendControlBase : HmiControlWindowBase
{
    public IList<HmiTrendPen> Pens { get; } = new List<HmiTrendPen>();

    public IList<HmiTrendOverlay> Overlays { get; } = new List<HmiTrendOverlay>();
    public IList<HmiTrendTemplateOption> TemplateOptions { get; } = new List<HmiTrendTemplateOption>();

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

    public string? ChartTitle { get; set; }

    public HmiProperty<bool>? DisplayChartTitle { get; set; }

    public string? DataServerName { get; set; }

    public HmiProperty<bool>? DisplayHistoricalLoadProgress { get; set; }

    public HmiProperty<bool>? DisplayLineLegend { get; set; }

    public HmiProperty<bool>? DisplayLineLegendMinimumMaximum { get; set; }

    public HmiProperty<HmiTrendPenCaptionMode>? LineLegendPenCaptionMode { get; set; }

    public HmiProperty<int>? LineLegendMaximumCaptionLength { get; set; }

    public HmiProperty<HmiTrendLegendPosition>? LineLegendPosition { get; set; }

    public HmiProperty<int>? LineLegendMaximumVisiblePens { get; set; }

    public HmiProperty<bool>? DisplayCurrentValueLegend { get; set; }

    public HmiProperty<bool>? CurrentValueLegendDisplayPenIcons { get; set; }

    public HmiProperty<bool>? CurrentValueLegendDisplayValues { get; set; }

    public HmiProperty<bool>? CurrentValueLegendDisplayTime { get; set; }

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

    public IList<string> RuntimePropertyTabs { get; } = new List<string>();

    public HmiProperty<bool>? AllowEditingLegendProperties { get; set; }

    public HmiProperty<bool>? AllowPanZoom { get; set; }

    public HmiProperty<bool>? AllowPauseResumeScrolling { get; set; }

    public HmiProperty<bool>? AllowShowHideValueBar { get; set; }

    public HmiProperty<bool>? AllowSnapshotCreation { get; set; }

    public HmiProperty<bool>? AllowOverlayOptions { get; set; }

    public HmiProperty<bool>? AllowPrint { get; set; }

    public HmiProperty<bool>? AllowDeltaValueBar { get; set; }

    public HmiProperty<bool>? AllowExportTrendData { get; set; }

    public HmiProperty<bool>? AllowExportDataLogModelData { get; set; }

    public HmiProperty<bool>? ShowToolbar { get; set; }

    public HmiProperty<bool>? ShowTimePeriodBar { get; set; }

    public HmiProperty<bool>? ShowTagExplorer { get; set; }

    public HmiProperty<bool>? CollapseTagExplorer { get; set; }

    public HmiProperty<bool>? ShowTagList { get; set; }

    public HmiProperty<bool>? CollapseTagList { get; set; }

    public HmiProperty<bool>? ShowXAxisCursors { get; set; }

    public HmiProperty<bool>? ShowYAxisCursors { get; set; }

    public HmiProperty<bool>? SingleTraceMode { get; set; }

    public HmiProperty<bool>? RubberBandZoomEnabled { get; set; }

    public HmiProperty<bool>? TimePeriodAbsoluteMode { get; set; }

    public HmiProperty<string>? TimePeriodDuration { get; set; }

    public HmiProperty<string>? TimePeriodStart { get; set; }

    public HmiProperty<string>? TimePeriodEnd { get; set; }

    public HmiProperty<bool>? ShowAlarmCursor { get; set; }

    public HmiProperty<bool>? ShowEventList { get; set; }

    public HmiProperty<bool>? CollapseEventList { get; set; }

    public HmiProperty<bool>? LegacyShowAlarmEventList { get; set; }

    public HmiProperty<bool>? LegacyCollapseAlarmEventList { get; set; }
}
