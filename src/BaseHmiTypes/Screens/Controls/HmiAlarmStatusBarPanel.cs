using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiAlarmStatusBarPanel
{
    public HmiAlarmStatusBarPanelType Type { get; set; }

    public string? SourceType { get; set; }

    public HmiProperty<bool>? Visible { get; set; }

    public HmiProperty<int>? Order { get; set; }

    public HmiMultilingualText? Tooltip { get; set; }
    public HmiMultilingualText? Text { get; set; }
    public HmiProperty<double>? Width { get; set; }
    public HmiProperty<bool>? AutoSize { get; set; }
}
