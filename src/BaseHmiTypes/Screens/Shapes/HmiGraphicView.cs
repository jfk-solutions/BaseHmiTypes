using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public class HmiGraphicView : HmiSurfaceShapeBase
{
    public HmiGraphicView()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiGraphicView;
    }

    //TODO: we have here Source and Image. Source used in Unified, Image in Adavnced and WinnCC (as blob uri atm)
    public HmiProperty<string>? Source { get; set; }

    /// <summary>Process value used to select a configured graphic-list entry.</summary>
    public HmiProperty<double>? Value { get; set; }

    public HmiProperty<HmiImageSource>? Image { get; set; }

    public HmiProperty<HmiImageSource>? AlternateImage { get; set; }

    public HmiProperty<bool>? ImageScaled { get; set; }

    /// <summary>When scaling the image, preserve its aspect ratio inside the graphical frame.</summary>
    public HmiProperty<bool>? ImageKeepAspectRatio { get; set; }

    public HmiProperty<bool>? ImageBlink { get; set; }

    public HmiProperty<HmiColor>? ImageColor { get; set; }

    public HmiProperty<HmiColor>? ImageBackgroundColor { get; set; }

    public HmiProperty<bool>? ImageBackgroundTransparent { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? ImageHorizontalAlignment { get; set; }

    public HmiProperty<HmiVerticalAlignment>? ImageVerticalAlignment { get; set; }

    public HmiProperty<int>? GraphicStretchMode { get; set; }

    /// <summary>Additional image extents outside the logical frame. The source image includes these extents.</summary>
    public HmiThickness? ImageOverflowPadding { get; set; }

    /// <summary>Draws borders wider than one pixel inside the frame when true, or centered on it when false.</summary>
    public HmiProperty<bool>? DrawStrokeInsideFrame { get; set; }
    public HmiProperty<string>? FillDirection { get; set; }

    public HmiProperty<int>? FillLevel { get; set; }

    public HmiProperty<bool>? ShowFillLevel { get; set; }

}
