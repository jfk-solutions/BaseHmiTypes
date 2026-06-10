using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public abstract class HmiSelectionGroupBase : HmiWidgetBase
{
    public IList<string> Items { get; } = new List<string>();

    public HmiProperty<int>? SelectedIndex { get; set; }

    public HmiProperty<int>? SelectionMode { get; set; }

    public HmiProperty<double>? SelectionItemHeight { get; set; }

    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }

    public HmiProperty<HmiColor>? EvenRowBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionBorderColor { get; set; }

    public HmiProperty<double>? SelectionBorderWidth { get; set; }
}
