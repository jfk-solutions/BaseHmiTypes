using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public abstract class HmiButtonBase : HmiWidgetBase
{
    public IList<HmiState> States { get; } = new List<HmiState>();

    public HmiProperty<double>? State { get; set; }

    public HmiProperty<HmiMultilingualText>? Text { get; set; }

    public HmiProperty<HmiMultilingualText>? AlternateText { get; set; }

    public HmiProperty<HmiImageSource>? Image { get; set; }

    public HmiProperty<HmiImageSource>? AlternateImage { get; set; }

    public HmiProperty<bool>? ImageScaled { get; set; }

    public HmiProperty<bool>? ImageBlink { get; set; }

    public HmiProperty<int>? GraphicStretchMode { get; set; }

    public HmiProperty<string>? HotKey { get; set; }

    public HmiProperty<string>? PressedStateTags { get; set; }

    public HmiProperty<int>? StyleSettings { get; set; }

    public HmiProperty<bool>? WindowsStyle { get; set; }

    /// <summary>
    /// Gets or sets whether the operator can activate the button with a pointer or touch screen.
    /// </summary>
    public HmiProperty<bool>? TouchEnabled { get; set; }

    public HmiProperty<HmiColor>? CaptionColor { get; set; }

    public HmiProperty<HmiColor>? CaptionBackgroundColor { get; set; }

    /// <summary>
    /// Gets or sets the touch-insensitive area inside the button bounds.
    /// </summary>
    public HmiThickness? TouchMargin { get; set; }
}
