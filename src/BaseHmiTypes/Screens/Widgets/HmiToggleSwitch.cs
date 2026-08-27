using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiToggleSwitch : HmiButtonBase
{
    public HmiToggleSwitch()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiToggleSwitch;
    }

    public HmiProperty<HmiSwitchType>? Mode { get; set; }

    public HmiProperty<bool>? Header { get; set; }

    public HmiProperty<HmiMultilingualText>? HeaderText { get; set; }

    public HmiProperty<HmiMultilingualText>? Remark { get; set; }

    public HmiProperty<HmiToggleSwitchShapeType>? ShapeType { get; set; }

    public HmiProperty<HmiColor>? OffThumbColor { get; set; }

    public HmiProperty<HmiColor>? OnThumbColor { get; set; }
}
