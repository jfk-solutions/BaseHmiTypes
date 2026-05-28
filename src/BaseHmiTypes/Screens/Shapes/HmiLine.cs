using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public class HmiLine : HmiSurfaceShapeBase
{
    public HmiProperty<double>? X1 { get; set; }

    public HmiProperty<double>? Y1 { get; set; }

    public HmiProperty<double>? X2 { get; set; }

    public HmiProperty<double>? Y2 { get; set; }
}
