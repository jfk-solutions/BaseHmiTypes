using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiRecipeColumn
{
    public HmiRecipeColumnType Type { get; set; }

    public string? SourceType { get; set; }

    public HmiProperty<bool>? Visible { get; set; }

    public HmiProperty<double>? Width { get; set; }

    public HmiMultilingualText? HeaderText { get; set; }
}
