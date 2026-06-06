using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public class HmiEllipseSegment : HmiEllipse
{
    public HmiEllipseSegment()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiEllipseSegment;
    }

    public HmiProperty<double> StartAngle { get; set; } = 0;

    public HmiProperty<double> SweepAngle { get; set; } = 0;
}
