using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public abstract class HmiSelectionGroupBase : HmiWidgetBase
{
    public IList<string> Items { get; } = new List<string>();

    public HmiProperty<int>? SelectedIndex { get; set; }

    public HmiProperty<int>? SelectionMode { get; set; }

    public HmiProperty<double>? SelectionItemHeight { get; set; }
}
