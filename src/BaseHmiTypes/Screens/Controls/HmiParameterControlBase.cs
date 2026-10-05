using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public abstract class HmiParameterControlBase : HmiControlWindowBase
{
    public HmiProperty<bool>? AllowSortByColumn { get; set; }
    public HmiProperty<bool>? AllowFilterByColumn { get; set; }
    public HmiProperty<int>? GridLineVisibility { get; set; }
    public HmiProperty<int>? GridSelectionMode { get; set; }
    public HmiProperty<int>? ColoringMode { get; set; }
    public HmiProperty<int>? HorizontalScrollBarVisibility { get; set; }
    public HmiProperty<int>? VerticalScrollBarVisibility { get; set; }
    public HmiProperty<bool>? AllowColumnReorder { get; set; }
    public HmiProperty<bool>? AllowColumnResize { get; set; }
    public HmiProperty<int>? ColumnHeaderType { get; set; }
    public HmiProperty<int>? RowHeaderType { get; set; }
    public HmiProperty<HmiColor>? HeaderSelectionBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? HeaderSelectionForegroundColor { get; set; }
    public HmiProperty<bool>? SelectFullRow { get; set; }
    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionBorderColor { get; set; }
    public HmiProperty<double>? SelectionBorderWidth { get; set; }
    public IList<HmiParameterColumn> ColumnDefinitions { get; } = new List<HmiParameterColumn>();
    public HmiProperty<HmiColor>? GridLineColor { get; set; }
    public HmiProperty<double>? GridLineWidth { get; set; }
    public HmiProperty<double>? RowHeight { get; set; }
    public HmiProperty<double>? CellPaddingLeft { get; set; }
    public HmiProperty<double>? CellPaddingTop { get; set; }
    public HmiProperty<double>? CellPaddingRight { get; set; }
    public HmiProperty<double>? CellPaddingBottom { get; set; }
    /// <summary>Native editing-mode value; no cross-family enum translation is assumed.</summary>
    public HmiProperty<int>? EditMode { get; set; }
    public HmiProperty<bool>? ShowToolbar { get; set; }
    public HmiProperty<bool>? ShowStatusBar { get; set; }
    public HmiProperty<HmiColor>? ToolbarBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ToolbarForegroundColor { get; set; }
    public HmiFont? ToolbarFont { get; set; }
    public HmiFont? StatusBarFont { get; set; }
    public HmiProperty<HmiColor>? StatusBarBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? StatusBarForegroundColor { get; set; }
}
