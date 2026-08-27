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

    public HmiProperty<bool>? ShowAddressBar { get; set; }

    public HmiProperty<bool>? UseParameterPlaceholders { get; set; }

    public HmiProperty<bool>? NavigateBack { get; set; }

    public HmiProperty<bool>? NavigateForward { get; set; }

    public HmiProperty<bool>? Stop { get; set; }

    public HmiProperty<bool>? Refresh { get; set; }
}
