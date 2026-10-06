using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiParameterColumn
{
    public string? Name { get; set; }
    public string? Key { get; set; }
    public HmiMultilingualText? HeaderText { get; set; }
    public HmiProperty<int>? HeaderTextTrimming { get; set; }
    public HmiProperty<int>? ContentTextTrimming { get; set; }
    public HmiProperty<HmiHorizontalAlignment>? HeaderHorizontalAlignment { get; set; }
    public HmiProperty<HmiVerticalAlignment>? HeaderVerticalAlignment { get; set; }
    public HmiProperty<bool>? Visible { get; set; }
    public HmiProperty<bool>? Enabled { get; set; }
    public HmiProperty<HmiColor>? BackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ForegroundColor { get; set; }
    public HmiProperty<uint>? Width { get; set; }
    public HmiProperty<uint>? MinimumWidth { get; set; }
    public HmiProperty<uint>? MaximumWidth { get; set; }
    public HmiProperty<bool>? AllowSort { get; set; }
    public HmiProperty<int>? SortOrder { get; set; }
    public HmiProperty<int>? SortDirection { get; set; }
    public HmiProperty<string>? OutputFormat { get; set; }
}
