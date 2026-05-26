using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public abstract class HmiPointBasedShapeBase : HmiSurfaceShapeBase
{
    public IList<HmiPoint> Points { get; } = new List<HmiPoint>();
}
