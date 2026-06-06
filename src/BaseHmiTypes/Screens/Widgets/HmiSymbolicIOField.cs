using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiSymbolicIOField : HmiTextWidgetBase
{
    public HmiSymbolicIOField()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiSymbolicIOField;
    }

    public HmiProperty<int>? Mode { get; set; }

    public HmiProperty<bool>? ShowDropDownButton { get; set; }

    public HmiProperty<bool>? ShowDropDownList { get; set; }
}
