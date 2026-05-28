using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiMediaControl : HmiControlWindowBase
{
    public HmiProperty<string>? Source { get; set; }

    public HmiProperty<bool>? AutoPlay { get; set; }
}
