using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public abstract class HmiSelectionGroupBase : HmiWidgetBase
{
    public IList<HmiSelectionGroupItem> Items { get; } = new List<HmiSelectionGroupItem>();

    public HmiProperty<int>? SelectedIndex { get; set; }

    public HmiProperty<int>? SelectionMode { get; set; }

    public HmiProperty<double>? SelectionItemHeight { get; set; }

    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }

    public HmiProperty<HmiColor>? EvenRowBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionBorderColor { get; set; }

    public HmiProperty<double>? SelectionBorderWidth { get; set; }
}

public class HmiSelectionGroupItem
{
    public string? Text { get; set; }

    public HmiImageSource? Image { get; set; }

    public string? ImageName { get; set; }
}
