using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public class HmiUnkown : HmiSurfaceShapeBase
{
    public HmiUnkown()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiUnkown;
    }

    public string? Type { get; set; }
}
