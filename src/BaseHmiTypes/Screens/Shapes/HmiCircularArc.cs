using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public class HmiCircularArc : HmiCircularShapeBase
{
    public HmiCircularArc()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiCircularArc;
    }

    public HmiProperty<double> StartAngle { get; set; } = 0;

    public HmiProperty<double> SweepAngle { get; set; } = 0;
}
