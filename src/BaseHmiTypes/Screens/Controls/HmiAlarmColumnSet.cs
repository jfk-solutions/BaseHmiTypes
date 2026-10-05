using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

/// <summary>A named column configuration, such as a message list or statistics list.</summary>
public sealed class HmiAlarmColumnSet
{
    public string? Name { get; set; }
    public HmiProperty<bool>? AllowSort { get; set; }
    public HmiProperty<bool>? AllowFilter { get; set; }
    public HmiProperty<bool>? AllowColumnReorder { get; set; }
    public HmiProperty<bool>? AllowColumnResize { get; set; }
    public HmiProperty<HmiColor>? BackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ForegroundColor { get; set; }
    public HmiProperty<HmiColor>? HeaderBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? HeaderForegroundColor { get; set; }
    public HmiProperty<HmiColor>? HeaderBorderColor { get; set; }
    public HmiFont? ContentFont { get; set; }
    public HmiFont? HeaderFont { get; set; }
    public HmiProperty<HmiColor>? GridLineColor { get; set; }
    public HmiProperty<double>? GridLineWidth { get; set; }
    /// <summary>Native visibility code; unknown values remain available without assuming flags semantics.</summary>
    public HmiProperty<int>? GridLineVisibility { get; set; }
    public HmiProperty<double>? CellPaddingLeft { get; set; }
    public HmiProperty<double>? CellPaddingTop { get; set; }
    public HmiProperty<double>? CellPaddingRight { get; set; }
    public HmiProperty<double>? CellPaddingBottom { get; set; }
    /// <summary>Configured row height; zero requests automatic sizing.</summary>
    public HmiProperty<double>? RowHeight { get; set; }
    public HmiProperty<int>? HorizontalScrollBarVisibility { get; set; }
    public HmiProperty<int>? VerticalScrollBarVisibility { get; set; }
    public HmiProperty<int>? GridSelectionMode { get; set; }
    public HmiProperty<bool>? SelectFullRow { get; set; }
    public HmiProperty<HmiColor>? AlternateBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? AlternateForegroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionBorderColor { get; set; }
    public HmiProperty<HmiColor>? HeaderSelectionBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? HeaderSelectionForegroundColor { get; set; }
    public HmiProperty<double>? SelectionBorderWidth { get; set; }
    public IList<HmiAlarmColumn> Columns { get; } = new List<HmiAlarmColumn>();
}
