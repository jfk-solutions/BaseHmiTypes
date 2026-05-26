using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public abstract class HmiSelectionGroupBase : HmiWidgetBase
{
    public IList<string> Items { get; } = new List<string>();
}
