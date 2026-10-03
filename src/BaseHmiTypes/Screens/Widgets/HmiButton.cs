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

    /// <summary>For frames wider than one pixel, false centers the stroke on the bounds. True/omitted draws inside. The 3D bevel is separate.</summary>
    public HmiProperty<bool>? DrawStrokeInsideFrame { get; set; }

    /// <summary>The configured pressed snapshot; preview rendering does not change tags or operate the button.</summary>
    public HmiProperty<bool>? Pressed { get; set; }

    /// <summary>True identifies a latching/toggle button, exposing its pressed snapshot as an accessible toggle state.</summary>
    public HmiProperty<bool>? Toggle { get; set; }
}
