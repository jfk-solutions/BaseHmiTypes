using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiAlarmToolbarButton
{
    public HmiAlarmToolbarButtonType Type { get; set; }

    public string? SourceType { get; set; }

    public HmiProperty<bool>? Visible { get; set; }

    public HmiProperty<int>? Order { get; set; }

    public HmiMultilingualText? Caption { get; set; }

    public HmiMultilingualText? Tooltip { get; set; }

    public string? Format { get; set; }
}
