using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public class HmiUnkown : HmiSurfaceShapeBase
{
    public HmiUnkown()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiUnkown;
    }

    public string? Type { get; set; }

    public string? SourceFormat { get; set; }

    public byte[]? SourceData { get; set; }

    public Dictionary<string, string> SourceProperties { get; } = [];
}
