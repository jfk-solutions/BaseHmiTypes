using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

/// <summary>A configured column in one of the companion's three evaluation views.</summary>
public sealed class HmiTrendCompanionColumn
{
    public int Mode { get; set; }
    public int InfoBlock { get; set; }
    public string? Name { get; set; }
    public HmiMultilingualText? HeaderText { get; set; }
    public HmiProperty<bool>? Visible { get; set; }
    public HmiProperty<double>? Width { get; set; }
}
