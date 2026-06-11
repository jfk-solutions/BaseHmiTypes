using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public abstract class HmiSurfaceShapeBase : HmiShapeBase
{
    public HmiProperty<HmiLineStyle>? EdgeStyle { get; set; }
}
