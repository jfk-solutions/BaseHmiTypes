using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public abstract class HmiEllipticalShapeBase : HmiCentricShapeBase
{
    public double RadiusX { get; set; }

    public double RadiusY { get; set; }
}
