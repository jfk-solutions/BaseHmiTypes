using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public sealed class HmiState
{
    public string? Name { get; set; }

    public double? Value { get; set; }

    public HmiMultilingualText? Text { get; set; }

    public string? ImageName { get; set; }

    public HmiImageSource? Image { get; set; }

    public bool? ImageScaled { get; set; }

    public HmiColor? ForegroundColor { get; set; }

    public HmiColor? BackgroundColor { get; set; }

    public HmiColor? BorderColor { get; set; }

    public bool Blink { get; set; }
}
