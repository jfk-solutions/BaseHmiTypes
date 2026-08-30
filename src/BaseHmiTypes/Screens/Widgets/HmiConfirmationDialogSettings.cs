using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiConfirmationDialogSettings
{
    public bool? Enabled { get; set; }

    public HmiConfirmationButtons? Buttons { get; set; }

    public bool? TitleBarVisible { get; set; }

    public HmiMultilingualText? Title { get; set; }

    public string? WindowPosition { get; set; }

    public HmiMultilingualText? Message { get; set; }

    public HmiFont? MessageFont { get; set; }

    public string? ImageReference { get; set; }

    /// <summary>Resolved project image while <see cref="ImageReference"/> preserves the source filename.</summary>
    public HmiImageSource? Image { get; set; }

    public bool? ImageScaled { get; set; }

    public HmiColor? ImageColor { get; set; }

    public HmiColor? ImageBackgroundColor { get; set; }

    public bool? ImageBackgroundTransparent { get; set; }
}
