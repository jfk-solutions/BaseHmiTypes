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

    public HmiProperty<HmiImageSource>? Image { get; set; }

    public HmiProperty<HmiImageSource>? AlternateImage { get; set; }

    public HmiProperty<int>? GraphicStretchMode { get; set; }
}
