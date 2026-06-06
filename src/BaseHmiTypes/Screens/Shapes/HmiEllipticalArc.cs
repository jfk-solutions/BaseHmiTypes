using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public class HmiEllipticalArc : HmiEllipticalShapeBase
{
    public HmiEllipticalArc()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiEllipticalArc;
    }

    public HmiProperty<double> StartAngle { get; set; } = 0;

    public HmiProperty<double> SweepAngle { get; set; } = 0;
}
