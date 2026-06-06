using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiWebControl : HmiControlWindowBase
{
    public HmiWebControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiWebControl;
    }

    public HmiProperty<string>? Url { get; set; }

    public HmiProperty<string>? HomeUrl { get; set; }
}
