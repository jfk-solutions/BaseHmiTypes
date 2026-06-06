using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.ScreenManagement;

public class HmiScreenWindowLayout : HmiScreenModelBase
{
    public HmiScreenWindowLayout()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiScreenWindowLayout;
    }

    public IList<HmiTopLevelScreenWindow> Windows { get; } = new List<HmiTopLevelScreenWindow>();
}
