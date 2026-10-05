using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

/// <summary>Stored toolbar configuration; commands are not inferred from source identities.</summary>
public sealed class HmiTrendToolbarButton
{
    public string? SourceType { get; set; }
    public HmiProperty<bool>? Visible { get; set; }
    public HmiProperty<bool>? Enabled { get; set; }
    public HmiProperty<int>? Order { get; set; }
    public HmiMultilingualText? Tooltip { get; set; }
}
