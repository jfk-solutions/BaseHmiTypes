using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public class HmiRectangle : HmiSurfaceShapeBase
{
    public HmiProperty<double>? TopLeftRadius { get; set; }

    public HmiProperty<double>? TopRightRadius { get; set; }

    public HmiProperty<double>? BottomLeftRadius { get; set; }

    public HmiProperty<double>? BottomRightRadius { get; set; }
}
