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

    public HmiProperty<int>? ActiveTraceIndex { get; set; }

    public HmiProperty<bool>? ActiveTraceVisible { get; set; }

    public HmiProperty<bool>? ActiveTraceJoinPoints { get; set; }

    public HmiProperty<HmiColor>? ActiveTraceLineColor { get; set; }

    public HmiProperty<HmiLineStyle>? ActiveTraceLineStyle { get; set; }

    public HmiProperty<double>? ActiveTraceLineWidth { get; set; }

    public HmiProperty<bool>? ActiveTraceDecimalFormat { get; set; }

    public HmiProperty<int>? ActiveTraceNumericPrecision { get; set; }

    public HmiProperty<bool>? ActivePlottingAlgorithmLinear { get; set; }

    public HmiProperty<HmiColor>? ActiveMarkerColor { get; set; }

    public HmiProperty<int>? ActiveMarkerShape { get; set; }

    public HmiProperty<int>? ActiveMarkerSize { get; set; }

    public HmiProperty<bool>? ActiveMarkerVisible { get; set; }

    public HmiProperty<HmiColor>? ActiveXAxisColor { get; set; }

    public HmiProperty<bool>? ActiveXAxisGridLinesVisible { get; set; }

    public HmiProperty<int>? ActiveXAxisLineWidth { get; set; }

    public HmiProperty<double>? ActiveXAxisMajorTickScale { get; set; }

    public HmiProperty<double>? ActiveXAxisMaximumValue { get; set; }

    public HmiProperty<double>? ActiveXAxisMinorTickMarks { get; set; }

    public HmiProperty<double>? ActiveXAxisMinimumValue { get; set; }

    public HmiProperty<HmiTrendAxisScalingMode>? ActiveXAxisScalingMode { get; set; }

    public HmiProperty<bool>? ActiveXAxisVisible { get; set; }

    public HmiProperty<HmiColor>? ActiveYAxisColor { get; set; }

    public HmiProperty<bool>? ActiveYAxisGridLinesVisible { get; set; }

    public HmiProperty<int>? ActiveYAxisLineWidth { get; set; }

    public HmiProperty<double>? ActiveYAxisMajorTickScale { get; set; }

    public HmiProperty<double>? ActiveYAxisMaximumValue { get; set; }

    public HmiProperty<double>? ActiveYAxisMinorTickMarks { get; set; }

    public HmiProperty<double>? ActiveYAxisMinimumValue { get; set; }

    public HmiProperty<HmiTrendAxisScalingMode>? ActiveYAxisScalingMode { get; set; }

    public HmiProperty<bool>? ActiveYAxisVisible { get; set; }

    public string? ControlType { get; set; }

    public string? CurrentTagName { get; set; }

    public string? CurrentXTagName { get; set; }

    public string? CurrentYTagName { get; set; }

    public HmiProperty<bool>? UseCustomFileExplorer { get; set; }

    public HmiProperty<bool>? AutoScale { get; set; }

    public HmiProperty<bool>? ChartLiveMode { get; set; }

    public HmiProperty<double>? ChartZoomPercent { get; set; }

    public HmiProperty<HmiTrendStackAxesMode>? StackAxesMode { get; set; }

    public HmiProperty<HmiColor>? WindowBackgroundColor { get; set; }

    public HmiProperty<bool>? LayoutLocked { get; set; }

    public HmiProperty<bool>? XAxisFlipped { get; set; }

    public HmiProperty<bool>? YAxisFlipped { get; set; }

    public HmiProperty<bool>? AxesLocked { get; set; }

    public HmiProperty<bool>? DisplayOverlayZoomPanel { get; set; }

    public HmiProperty<bool>? ShowOutsidePoints { get; set; }

    public HmiProperty<bool>? ShowToolTip { get; set; }

    public HmiProperty<bool>? ToolTipShowValue { get; set; }

    public HmiProperty<bool>? ToolTipShowTime { get; set; }

    public HmiProperty<bool>? ToolTipShowQuality { get; set; }

    public HmiFont? ChartTitleFont { get; set; }

    public HmiThickness? PlotAreaMargin { get; set; }

    public string? BackgroundPicturePath { get; set; }

    public HmiProperty<bool>? ActivePlotAsTitle { get; set; }

    public string? PlotScalingMethod { get; set; }

    public string? DefaultScalingMode { get; set; }

    public string? AxesPosition { get; set; }

    public string? TimeAlignment { get; set; }

    public HmiProperty<bool>? ShowCursorTimeDifference { get; set; }

    public HmiProperty<bool>? ShowCursorValueDifference { get; set; }

    public HmiProperty<bool>? DisplayQualifiedTagNames { get; set; }

    public HmiProperty<bool>? HighlightActive { get; set; }

    public HmiProperty<HmiColor>? HighlightLineColor { get; set; }

    public HmiProperty<HmiLineStyle>? HighlightLineStyle { get; set; }

    public HmiProperty<double>? HighlightLineWidth { get; set; }

    public string? TraceDimmingMode { get; set; }

    public HmiProperty<HmiColor>? MeanLineColor { get; set; }

    public HmiProperty<HmiColor>? Zone1Color { get; set; }

    public HmiProperty<HmiColor>? Zone2Color { get; set; }

    public HmiProperty<HmiColor>? Zone3Color { get; set; }

    public HmiProperty<bool>? ShowZoneLines { get; set; }

    public HmiProperty<bool>? ShowZones { get; set; }
}
