using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public abstract class HmiSelectionGroupBase : HmiWidgetBase
{
    public IList<HmiState> States { get; } = new List<HmiState>();

    /// <summary>
    /// Gets or sets the number of configured states, excluding any error state.
    /// </summary>
    public HmiProperty<int>? ConfiguredStateCount { get; set; }

    public HmiProperty<HmiStateTriggerMode>? StateTriggerMode { get; set; }

    public HmiProperty<double>? Value { get; set; }

    public IList<HmiSelectionGroupItem> Items { get; } = new List<HmiSelectionGroupItem>();

    public HmiProperty<int>? SelectedIndex { get; set; }

    public HmiProperty<int>? SelectionMode { get; set; }

    public HmiProperty<bool>? WrapAround { get; set; }

    public HmiProperty<bool>? WriteOnEnter { get; set; }

    public HmiEnterHandshakeSettings? EnterHandshake { get; set; }

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
