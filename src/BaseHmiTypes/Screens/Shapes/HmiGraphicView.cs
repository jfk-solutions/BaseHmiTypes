using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public class HmiGraphicView : HmiSurfaceShapeBase
{
    public HmiProperty<string>? Source { get; set; }

    public HmiProperty<HmiImageSource>? Image { get; set; }

    public HmiProperty<HmiImageSource>? AlternateImage { get; set; }

    public HmiProperty<int>? GraphicStretchMode { get; set; }
}
