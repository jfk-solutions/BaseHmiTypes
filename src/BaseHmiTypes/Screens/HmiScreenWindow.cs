using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens;

public class HmiScreenWindow : HmiWindowBase
{
    public HmiScreenWindow()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiScreenWindow;
    }

    public HmiProperty<string>? ScreenId { get; set; }

    public HmiProperty<string>? ScreenName { get; set; }

    public HmiProperty<bool>? TabIntoWindow { get; set; }

    public HmiProperty<int>? StartupPosition { get; set; }

    public HmiProperty<int>? WindowState { get; set; }

    public HmiProperty<bool>? IsModal { get; set; }

    public HmiProperty<double>? OffsetLeft { get; set; }

    public HmiProperty<double>? OffsetTop { get; set; }
}
