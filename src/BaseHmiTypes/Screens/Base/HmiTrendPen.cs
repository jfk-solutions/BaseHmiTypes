using BaseHmiTypes.Common;

namespace BaseHmiTypes.Screens.Base;

public sealed class HmiTrendPen
{
    /// <summary>
    /// One-based pen number as exposed by the engineering system.
    /// </summary>
    public int Number { get; set; }

    public string? Name { get; set; }

    public string? Label { get; set; }
    public HmiMultilingualText? LabelText { get; set; }

    /// <summary>The named trend window assigned to this pen.</summary>
    public string? TrendWindowName { get; set; }

    /// <summary>The named time axis assigned to this pen.</summary>
    public string? TimeAxisName { get; set; }

    public HmiProperty<double>? Value { get; set; }

    public HmiProperty<HmiColor>? Color { get; set; }

    public HmiProperty<bool>? Visible { get; set; }

    public HmiProperty<double>? Width { get; set; }

    public HmiProperty<HmiTrendPenType>? Type { get; set; }

    public HmiProperty<HmiTrendLineType>? LineType { get; set; }

    public HmiProperty<HmiLineStyle>? Style { get; set; }

    /// <summary>Gets or sets whether the area below the trend line is filled.</summary>
    public HmiProperty<bool>? FillVisible { get; set; }

    /// <summary>Gets or sets the area-fill color independently of the trend line color.</summary>
    public HmiProperty<HmiColor>? FillColor { get; set; }

    public HmiProperty<bool>? LowerLimitColoring { get; set; }

    public HmiProperty<double>? LowerLimitValue { get; set; }

    public HmiProperty<HmiColor>? LowerLimitColor { get; set; }

    public HmiProperty<bool>? UpperLimitColoring { get; set; }

    public HmiProperty<double>? UpperLimitValue { get; set; }

    public HmiProperty<HmiColor>? UpperLimitColor { get; set; }

    /// <summary>Gets or sets whether uncertain-quality values use a dedicated color.</summary>
    public HmiProperty<bool>? UncertainColoring { get; set; }

    /// <summary>Gets or sets the color used for uncertain-quality values.</summary>
    public HmiProperty<HmiColor>? UncertainColor { get; set; }

    /// <summary>Gets or sets whether alarm symbols are displayed for limit violations.</summary>
    public HmiProperty<bool>? ShowAlarms { get; set; }

    /// <summary>Gets or sets the vertical alignment of labels for the values-only trend type.</summary>
    public HmiProperty<HmiVerticalAlignment>? ValueAlignment { get; set; }

    /// <summary>
    /// Engineering-system marker name or numeric marker identifier.
    /// </summary>
    public HmiProperty<string>? Marker { get; set; }

    /// <summary>Gets or sets the marker color independently of the trend line color.</summary>
    public HmiProperty<HmiColor>? MarkerColor { get; set; }

    /// <summary>Gets or sets the marker width in pixels.</summary>
    public HmiProperty<double>? MarkerSize { get; set; }

    public HmiProperty<double>? MinimumValue { get; set; }

    public HmiProperty<double>? MaximumValue { get; set; }

    /// <summary>Gets or sets the scaling type of the value axis assigned to this pen.</summary>
    public HmiProperty<HmiTrendAxisScaleType>? AxisScaleType { get; set; }

    /// <summary>Gets or sets whether values on this pen's axis use exponential notation.</summary>
    public HmiProperty<bool>? ExponentialFormat { get; set; }

    /// <summary>Gets or sets whether decimal precision is derived automatically from the axis range.</summary>
    public HmiProperty<bool>? AutoDecimalPlaces { get; set; }

    /// <summary>Gets or sets the fixed decimal precision of the value axis assigned to this pen.</summary>
    public HmiProperty<int>? DecimalPlaces { get; set; }
    public HmiProperty<int>? ValueAxisDivisionCount { get; set; }
    public HmiProperty<bool>? ValueAxisAutoScale { get; set; }

    /// <summary>Gets or sets the identity of the shared value axis assigned to this pen.</summary>
    public string? ValueAxisName { get; set; }

    public HmiProperty<bool>? ValueAxisVisible { get; set; }

    public HmiProperty<HmiColor>? ValueAxisColor { get; set; }

    public HmiProperty<bool>? ValueAxisInTrendColor { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? ValueAxisAlignment { get; set; }

    public string? ValueAxisLabel { get; set; }
    public HmiMultilingualText? ValueAxisLabelText { get; set; }

    /// <summary>
    /// Gets or sets the current minimum value used to scale this pen.
    /// </summary>
    public HmiProperty<double>? CurrentScaleMinimumValue { get; set; }

    /// <summary>
    /// Gets or sets the current maximum value used to scale this pen.
    /// </summary>
    public HmiProperty<double>? CurrentScaleMaximumValue { get; set; }

    /// <summary>
    /// Gets or sets whether the pen's current value is in an error state.
    /// </summary>
    public HmiProperty<bool>? IsInError { get; set; }

    public HmiProperty<bool>? LinkData { get; set; }

    public string? DataLogModelName { get; set; }

    public string? DataSourceName { get; set; }

    public string? DataSourcePath { get; set; }

    public string? DataSourceApplication { get; set; }

    public string? Description { get; set; }

    public string? EngineeringUnit { get; set; }
    public HmiMultilingualText? EngineeringUnitText { get; set; }

    public HmiProperty<bool>? LogarithmicScale { get; set; }

    /// <summary>
    /// FactoryTalk pen index used as the lower boundary of a shaded range.
    /// </summary>
    public HmiProperty<int>? LowerBoundPenIndex { get; set; }

    /// <summary>
    /// FactoryTalk pen index used as the upper boundary of a shaded range.
    /// </summary>
    public HmiProperty<int>? UpperBoundPenIndex { get; set; }
}
