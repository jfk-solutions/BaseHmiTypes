using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public sealed class HmiState
{
    public string? Name { get; set; }

    public double? Value { get; set; }

    public HmiMultilingualText? Text { get; set; }

    public string? TargetDisplay { get; set; }

    public bool? CaptionUsesDisplayName { get; set; }

    public string? ImageName { get; set; }

    public HmiImageSource? Image { get; set; }

    public bool? ImageScaled { get; set; }

    public HmiColor? ImageColor { get; set; }

    public HmiColor? ImageBackgroundColor { get; set; }

    public bool? ImageBackgroundTransparent { get; set; }

    public HmiHorizontalAlignment? ImageHorizontalAlignment { get; set; }

    public HmiVerticalAlignment? ImageVerticalAlignment { get; set; }

    public HmiColor? CaptionColor { get; set; }

    public HmiColor? CaptionBackgroundColor { get; set; }

    public HmiHorizontalAlignment? CaptionHorizontalAlignment { get; set; }

    public HmiVerticalAlignment? CaptionVerticalAlignment { get; set; }

    public HmiColor? ForegroundColor { get; set; }

    public HmiColor? BackgroundColor { get; set; }

    public HmiColor? BorderColor { get; set; }

    public bool Blink { get; set; }

    public bool CaptionBlink { get; set; }

    public bool? CaptionBackgroundTransparent { get; set; }

    public bool ImageBlink { get; set; }
}
