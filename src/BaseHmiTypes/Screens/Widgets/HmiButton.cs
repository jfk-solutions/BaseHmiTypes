using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiButton : HmiButtonBase
{
    public HmiButton()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiButton;
    }

    public HmiProperty<HmiButtonType>? Mode { get; set; }

    /// <summary>Ellipse gives a circular outline when width and height are equal.</summary>
    public HmiProperty<HmiButtonShape>? Shape { get; set; }
}
