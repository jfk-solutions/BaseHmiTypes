using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiAlarmColumn
{
    public HmiAlarmColumnType Type { get; set; }
    public string? SourceType { get; set; }
    public HmiProperty<bool>? Visible { get; set; }

    public HmiProperty<double>? Width { get; set; }
    public HmiProperty<bool>? AutoSize { get; set; }
    public HmiProperty<int>? DecimalPlaces { get; set; }
    /// <summary>Configured native leading-zero setting; retained without assuming a formatting range.</summary>
    public HmiProperty<int>? LeadingZeros { get; set; }
    public HmiProperty<bool>? AutomaticDecimalPlaces { get; set; }
    public HmiProperty<bool>? ExponentialFormat { get; set; }
    public string? TimeAndDateFormat { get; set; }
    public string? DateFormat { get; set; }
    public string? TimeFormat { get; set; }
    public HmiProperty<bool>? ShowDate { get; set; }
    public HmiMultilingualText? HeaderText { get; set; }
    public string? Symbol { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? Alignment { get; set; }

    public HmiProperty<int>? Order { get; set; }
    /// <summary>Native row-sort mode, separate from column layout order.</summary>
    public HmiProperty<int>? SortMode { get; set; }
    /// <summary>Native sort priority; zero removes this criterion.</summary>
    public HmiProperty<int>? SortIndex { get; set; }
}
