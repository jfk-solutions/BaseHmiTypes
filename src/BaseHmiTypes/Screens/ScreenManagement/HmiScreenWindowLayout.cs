using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.ScreenManagement;

public class HmiScreenWindowLayout : HmiScreenModelBase
{
    public IList<HmiTopLevelScreenWindow> Windows { get; } = new List<HmiTopLevelScreenWindow>();
}
