using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiCheckBoxGroup : HmiSelectionGroupBase
{
    /// <summary>True places the checkbox indicator to the right of its caption; false/omitted keeps it on the left.</summary>
    public HmiProperty<bool>? IndicatorOnRight { get; set; }

    /// <summary>For borders wider than one pixel, true draws inside the frame and false centers on it. Omitted values retain inside placement.</summary>
    public HmiProperty<bool>? DrawStrokeInsideFrame { get; set; }

    /// <summary>A 32-bit selection mask; bit zero selects the first field. When set, this overrides SelectedIndex.</summary>
    public HmiProperty<uint>? SelectedFields { get; set; }

    public HmiCheckBoxGroup()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiCheckBoxGroup;
    }

}
