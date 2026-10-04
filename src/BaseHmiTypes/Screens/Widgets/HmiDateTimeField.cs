using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public sealed class HmiDateTimeField : HmiTextWidgetBase
{
    public HmiDateTimeField() => HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiDateTimeField;
    public HmiProperty<bool>? ShowDate { get; set; }
    public HmiProperty<bool>? ShowTime { get; set; }
}
