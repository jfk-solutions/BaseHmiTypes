using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public class HmiCircleSegment : HmiCircle
{
    public HmiProperty<double> StartAngle { get; set; } = 0;

    public HmiProperty<double> SweepAngle { get; set; } = 0;
}
