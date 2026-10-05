using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

/// <summary>Configured status-panel content; runtime values are not inferred from its identity.</summary>
public sealed class HmiTrendStatusBarPanel
{
    public string? SourceType { get; set; }
    public HmiProperty<bool>? Visible { get; set; }
    public HmiProperty<int>? Order { get; set; }
    public HmiMultilingualText? Text { get; set; }
    public HmiMultilingualText? Tooltip { get; set; }
    public HmiProperty<double>? Width { get; set; }
    public HmiProperty<bool>? AutoSize { get; set; }
}
