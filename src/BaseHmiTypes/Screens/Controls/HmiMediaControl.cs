using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiMediaControl : HmiControlWindowBase
{
    public HmiMediaControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiMediaControl;
    }

    public HmiProperty<string>? Source { get; set; }

    public HmiProperty<bool>? AutoPlay { get; set; }
}
