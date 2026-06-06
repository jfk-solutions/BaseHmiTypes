using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens;

public class HmiScreenMaster : HmiScreenBase
{
    public HmiScreenMaster()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiScreenMaster;
        Kind = HmiScreenKind.Template;
    }
}
