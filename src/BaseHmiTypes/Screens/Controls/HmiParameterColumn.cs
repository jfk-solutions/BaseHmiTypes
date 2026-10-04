using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiParameterColumn
{
    public string? Name { get; set; }
    public string? Key { get; set; }
    public HmiMultilingualText? HeaderText { get; set; }
    public HmiProperty<HmiHorizontalAlignment>? HeaderHorizontalAlignment { get; set; }
    public HmiProperty<HmiVerticalAlignment>? HeaderVerticalAlignment { get; set; }
    public HmiProperty<bool>? Visible { get; set; }
    public HmiProperty<uint>? Width { get; set; }
    public HmiProperty<uint>? MinimumWidth { get; set; }
    public HmiProperty<uint>? MaximumWidth { get; set; }
    public HmiProperty<bool>? AllowSort { get; set; }
    public HmiProperty<string>? OutputFormat { get; set; }
}
