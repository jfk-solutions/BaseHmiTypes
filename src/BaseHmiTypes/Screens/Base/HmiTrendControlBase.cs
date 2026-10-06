using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Controls;

namespace BaseHmiTypes.Screens.Base;

public abstract class HmiTrendControlBase : HmiControlWindowBase
{
    public int? DefinitionVersion { get; set; }

    public HmiProperty<bool>? ShowTableGridLines { get; set; }
    public HmiProperty<HmiColor>? TableGridLineColor { get; set; }
    public HmiProperty<HmiColor>? AlternatingRowBackgroundColor { get; set; }

    public IList<HmiTrendPen> Pens { get; } = new List<HmiTrendPen>();

    /// <summary>Configured value axes, including axes with no assigned pen.</summary>
    public IList<HmiTrendValueAxis> ValueAxes { get; } = new List<HmiTrendValueAxis>();
    /// <summary>Configured numeric X axes for XY plots, including unassigned axes.</summary>
    public IList<HmiTrendXValueAxis> XValueAxes { get; } = new List<HmiTrendXValueAxis>();
    public IList<HmiTrendWindow> TrendWindows { get; } = new List<HmiTrendWindow>();
    public IList<HmiTrendTimeAxis> TimeAxes { get; } = new List<HmiTrendTimeAxis>();

    public IList<HmiTrendOverlay> Overlays { get; } = new List<HmiTrendOverlay>();
    public IList<HmiTrendTemplateOption> TemplateOptions { get; } = new List<HmiTrendTemplateOption>();

    public HmiProperty<long>? TemplateLoadOptions1Mask { get; set; }

    public HmiProperty<long>? TemplateLoadOptions2Mask { get; set; }

    public HmiProperty<long>? TemplateLoadOptions3Mask { get; set; }

    public IList<HmiTrendBatch> Batches { get; } = new List<HmiTrendBatch>();

    public HmiProperty<double>? MinimumValue { get; set; }

    public HmiProperty<double>? MaximumValue { get; set; }

    public HmiProperty<HmiTrendChartStyle>? ChartStyle { get; set; }

    public HmiProperty<HmiTrendContainerType>? ContainerType { get; set; }

    public HmiProperty<int>? XAxisPenNumber { get; set; }

    public HmiProperty<HmiTrendUpdateMode>? UpdateMode { get; set; }

    public HmiProperty<double>? RefreshRateMilliseconds { get; set; }

    public HmiProperty<double>? HeartbeatMilliseconds { get; set; }

    public HmiProperty<double>? DeadbandPercent { get; set; }

    public HmiProperty<HmiTrendTimeFormat>? TimeFormat { get; set; }

    public HmiProperty<HmiTrendNumericRadix>? NumericRadix { get; set; }

    public HmiProperty<HmiTrendDataPointConnection>? DataPointConnection { get; set; }

    public HmiProperty<bool>? DisplayMilliseconds { get; set; }

    /// <summary>
    /// Gets or sets whether the chart time label shows elapsed time instead of clock time.
    /// </summary>
    public HmiProperty<bool>? DisplayElapsedTime { get; set; }

    public HmiProperty<bool>? DisplayPenIcons { get; set; }

    /// <summary>Gets or sets whether the pen name is used instead of its configured label.</summary>
    public HmiProperty<bool>? UseTrendNameAsLabel { get; set; }

    public HmiProperty<bool>? AllowScrolling { get; set; }

    public HmiProperty<HmiTrendScrollMode>? ScrollMode { get; set; }

    public HmiProperty<bool>? DisplayScrollMechanism { get; set; }

    public HmiProperty<HmiTrendScrollMechanism>? ScrollMechanism { get; set; }

    public HmiProperty<int>? BufferSizePerPen { get; set; }

    public string? ChartTitle { get; set; }
    public HmiMultilingualText? ChartTitleText { get; set; }

    public HmiProperty<bool>? DisplayChartTitle { get; set; }

    public string? DataServerName { get; set; }

    public HmiProperty<HmiTrendDataServer>? DataServer { get; set; }

    public HmiProperty<bool>? DisplayHistoricalLoadProgress { get; set; }

    public HmiProperty<bool>? DisplayLineLegend { get; set; }

    public HmiProperty<bool>? DisplayLineLegendMinimumMaximum { get; set; }

    public HmiProperty<HmiTrendPenCaptionMode>? LineLegendPenCaptionMode { get; set; }

    public HmiProperty<int>? LineLegendMaximumCaptionLength { get; set; }

    public HmiProperty<HmiTrendLegendPosition>? LineLegendPosition { get; set; }

    public HmiProperty<int>? LineLegendFirstVisibleRow { get; set; }

    public HmiProperty<int>? LineLegendMaximumVisiblePens { get; set; }

    public HmiProperty<bool>? DisplayCurrentValueLegend { get; set; }

    public HmiProperty<bool>? CurrentValueLegendDisplayPenIcons { get; set; }

    public HmiProperty<bool>? CurrentValueLegendDisplayValues { get; set; }

    public HmiProperty<bool>? CurrentValueLegendDisplayTime { get; set; }

    /// <summary>
    /// Gets or sets whether the interactive value bar is displayed on the chart.
    /// </summary>
    public HmiProperty<bool>? DisplayValueBar { get; set; }

    /// <summary>Gets or sets whether the value bar uses its configured color and width.</summary>
    public HmiProperty<bool>? UseGraphicValueBar { get; set; }

    public HmiProperty<HmiColor>? ValueBarColor { get; set; }

    public HmiProperty<double>? ValueBarWidth { get; set; }

    /// <summary>Gets or sets whether the value bar extends into the time axis.</summary>
    public HmiProperty<bool>? ShowValueBarInXAxis { get; set; }

    /// <summary>Gets or sets whether the two statistics-area rulers are displayed.</summary>
    public HmiProperty<bool>? DisplayStatisticRulers { get; set; }

    /// <summary>Gets or sets whether statistics rulers use their configured color and width.</summary>
    public HmiProperty<bool>? UseGraphicStatisticRulers { get; set; }

    public HmiProperty<HmiColor>? StatisticRulerColor { get; set; }

    public HmiProperty<double>? StatisticRulerWidth { get; set; }

    public HmiProperty<bool>? XAxisScaleVisible { get; set; }

    public HmiProperty<HmiColor>? XAxisColor { get; set; }

    /// <summary>Whether the time axis uses the first configured trend's color.</summary>
    public HmiProperty<bool>? XAxisInTrendColor { get; set; }

    public HmiProperty<HmiVerticalAlignment>? XAxisAlignment { get; set; }

    public string? XAxisLabel { get; set; }
    public HmiMultilingualText? XAxisLabelText { get; set; }

    public HmiProperty<bool>? XAxisDateVisible { get; set; }

    /// <summary>Gets or sets the time-axis date format, using dd, MM, MMM, yy and yyyy tokens.</summary>
    public HmiProperty<string>? XAxisDateFormat { get; set; }

    public HmiProperty<bool>? XAxisGridVisible { get; set; }

    public HmiProperty<bool>? MajorGridVisible { get; set; }

    public HmiProperty<HmiColor>? MajorGridColor { get; set; }

    public HmiProperty<bool>? MinorGridVisible { get; set; }

    public HmiProperty<HmiColor>? MinorGridColor { get; set; }

    /// <summary>Gets or sets whether the main grid uses the foreground pen color.</summary>
    public HmiProperty<bool>? GridInTrendColor { get; set; }

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

    public HmiProperty<HmiTrendTimeBase>? TimeBase { get; set; }

    /// <summary>Resolved project display zone (IANA ID, UTC, or Local), supplied by the host.</summary>
    public string? ProjectTimeZoneId { get; set; }

    public HmiProperty<HmiTrendYAxisRangeMode>? YAxisRangeMode { get; set; }

    public HmiProperty<HmiTrendYAxisCustomBoundSource>? YAxisCustomMinimumSource { get; set; }

    public HmiProperty<double>? YAxisCustomMinimumValue { get; set; }

    public string? YAxisCustomMinimumTagName { get; set; }

    public HmiProperty<HmiTrendYAxisCustomBoundSource>? YAxisCustomMaximumSource { get; set; }

    public HmiProperty<double>? YAxisCustomMaximumValue { get; set; }

    public string? YAxisCustomMaximumTagName { get; set; }

    public HmiProperty<bool>? YAxisIsolatedGraphing { get; set; }

    public HmiProperty<double>? YAxisIsolationPercent { get; set; }

    public HmiProperty<bool>? YAxisScaleVisible { get; set; }

    public HmiProperty<HmiColor>? YAxisColor { get; set; }

    /// <summary>Whether the value axis uses the first configured trend's color.</summary>
    public HmiProperty<bool>? YAxisInTrendColor { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? YAxisAlignment { get; set; }

    public string? YAxisLabel { get; set; }
    public HmiMultilingualText? YAxisLabelText { get; set; }

    public HmiProperty<int>? YAxisDecimalPlaces { get; set; }

    public HmiProperty<bool>? YAxisGridVisible { get; set; }

    public HmiProperty<int>? YAxisMajorGridLineCount { get; set; }

    public HmiProperty<int>? YAxisMinorGridLineCount { get; set; }

    public HmiProperty<HmiColor>? YAxisGridColor { get; set; }

    public HmiProperty<HmiTrendYAxisScaleMode>? YAxisScaleMode { get; set; }

    public HmiProperty<int>? YAxisScalePenNumber { get; set; }

    /// <summary>
    /// Gets or sets whether an additional axis with a percentage scale is displayed.
    /// </summary>
    public HmiProperty<bool>? ShowPercentageAxis { get; set; }

    /// <summary>
    /// Gets or sets the font and line color of the percentage axis.
    /// </summary>
    public HmiProperty<HmiColor>? PercentageAxisColor { get; set; }

    /// <summary>
    /// Gets or sets whether the percentage axis is aligned to the left or right.
    /// </summary>
    public HmiProperty<HmiHorizontalAlignment>? PercentageAxisAlignment { get; set; }

    [Obsolete("Use ShowPercentageAxis instead.")]
    public HmiProperty<bool>? YAxisScaleAsPercent
    {
        get => ShowPercentageAxis;
        set => ShowPercentageAxis = value;
    }

    [Obsolete("Use PercentageAxisColor instead.")]
    public HmiProperty<HmiColor>? YAxisPercentageColor
    {
        get => PercentageAxisColor;
        set => PercentageAxisColor = value;
    }

    /// <summary>
    /// Gets or sets the one-based pen whose scale is selected for the Y axis.
    /// </summary>
    public HmiProperty<int>? YAxisSelectedPenScale { get; set; }

    public IList<string> RuntimePropertyTabs { get; } = new List<string>();

    public HmiProperty<long>? RuntimeAttributesEnabledMask { get; set; }

    public HmiProperty<bool>? AllowEditingLegendProperties { get; set; }

    public HmiProperty<bool>? AllowRuntimeContextMenu { get; set; }

    public HmiProperty<bool>? AllowRuntimePenDragDrop { get; set; }

    public HmiProperty<bool>? RuntimeTrendEnabled { get; set; }

    public HmiProperty<bool>? AllowPanZoom { get; set; }

    public HmiProperty<bool>? AllowPauseResumeScrolling { get; set; }

    public HmiProperty<bool>? AllowShowHideValueBar { get; set; }

    public HmiProperty<bool>? AllowSnapshotCreation { get; set; }

    public HmiProperty<bool>? AllowOverlayOptions { get; set; }

    public HmiProperty<bool>? AllowOverlayPropertyPage { get; set; }

    public HmiProperty<bool>? AllowOverlayContextMenu { get; set; }

    public HmiProperty<bool>? AllowPrint { get; set; }

    public HmiProperty<bool>? AllowDeltaValueBar { get; set; }

    public HmiProperty<bool>? AllowExportTrendData { get; set; }

    public HmiProperty<bool>? AllowExportDataLogModelData { get; set; }

    public HmiProperty<bool>? ShowToolbar { get; set; }

    /// <summary>Gets or sets whether the toolbar is aligned to the top or bottom edge.</summary>
    public HmiProperty<HmiVerticalAlignment>? ToolbarAlignment { get; set; }

    public HmiProperty<bool>? UseToolbarBackgroundColor { get; set; }

    public HmiFont? ToolbarFont { get; set; }
    public HmiProperty<HmiColor>? ToolbarForegroundColor { get; set; }

    public HmiProperty<HmiColor>? ToolbarBackgroundColor { get; set; }

    /// <summary>
    /// Gets or sets the toolbar button size in pixels. A value of zero uses the WinCC default of 28 pixels.
    /// </summary>
    public HmiProperty<int>? ToolbarButtonSize { get; set; }

    public HmiProperty<bool>? ShowStatusBar { get; set; }

    public HmiProperty<bool>? UseStatusBarBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? StatusBarBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? StatusBarForegroundColor { get; set; }

    public HmiFont? StatusBarFont { get; set; }

    public HmiMultilingualText? StatusBarText { get; set; }

    public HmiProperty<bool>? ShowStatusBarTooltips { get; set; }

    public IList<HmiTrendStatusBarPanel> StatusBarPanels { get; } = new List<HmiTrendStatusBarPanel>();
    public IList<HmiTrendToolbarButton> ToolbarButtons { get; } = new List<HmiTrendToolbarButton>();

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

    public HmiProperty<int>? ActiveBatchIndex { get; set; }

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

    public HmiProperty<HmiTrendWindowStyle>? WindowStyle { get; set; }

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

    public HmiProperty<bool>? DisplayRetrievedDataOnTrend { get; set; }

    public string? RetrievalTimeZoneId { get; set; }

    public HmiProperty<double>? LiveDataTimeDeadbandTicks { get; set; }

    public HmiProperty<double>? LiveDataMaximumAgeTicks { get; set; }

    public HmiProperty<int>? LiveDataMaximumElements { get; set; }

    public HmiProperty<bool>? LiveDataStopWhenFull { get; set; }

    public HmiProperty<int>? LiveDataCollectorSizeType { get; set; }
}
