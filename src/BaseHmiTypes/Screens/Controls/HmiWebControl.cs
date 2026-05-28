using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiWebControl : HmiControlWindowBase
{
    public HmiProperty<string>? Url { get; set; }

    public HmiProperty<string>? HomeUrl { get; set; }
}
