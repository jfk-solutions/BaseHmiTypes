using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiLabel : HmiTextWidgetBase
{
    public HmiLabel()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiLabel;
    }

    public HmiProperty<int>? FieldLength { get; set; }
}
