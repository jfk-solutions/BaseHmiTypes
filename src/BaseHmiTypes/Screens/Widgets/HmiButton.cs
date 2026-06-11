using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiButton : HmiButtonBase
{
    public HmiButton()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiButton;
    }

    public HmiProperty<HmiButtonType>? Mode { get; set; }
}
