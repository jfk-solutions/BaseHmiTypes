using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public abstract class HmiCentricShapeBase : HmiShapeBase
{
    public HmiProperty<double> CenterX { get; set; } = 0;

    public HmiProperty<double> CenterY { get; set; } = 0;
}
