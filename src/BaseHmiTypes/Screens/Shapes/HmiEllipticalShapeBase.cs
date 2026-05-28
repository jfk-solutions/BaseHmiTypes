using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public abstract class HmiEllipticalShapeBase : HmiCentricShapeBase
{
    public HmiProperty<double> RadiusX { get; set; } = 0;

    public HmiProperty<double> RadiusY { get; set; } = 0;
}
