using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiButton : HmiWidgetBase
{
    public HmiButton()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiButton;
    }

    public HmiProperty<string>? Text { get; set; }

    public HmiProperty<string>? AlternateText { get; set; }

    public HmiProperty<HmiImageSource>? Image { get; set; }

    public HmiProperty<HmiImageSource>? AlternateImage { get; set; }

    public HmiProperty<int>? GraphicStretchMode { get; set; }

    public HmiProperty<string>? HotKey { get; set; }

    public HmiProperty<string>? PressedStateTags { get; set; }

    public HmiProperty<int>? Mode { get; set; }

    public HmiProperty<bool>? WindowsStyle { get; set; }

    public HmiProperty<HmiColor>? CaptionColor { get; set; }

    public HmiProperty<HmiColor>? CaptionBackgroundColor { get; set; }
}
