using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public abstract class HmiCircularShapeBase : HmiCentricShapeBase
{
    public HmiProperty<double> Radius { get; set; } = 0;
}
