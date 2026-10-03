using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiCheckBoxGroup : HmiSelectionGroupBase
{
    /// <summary>For borders wider than one pixel, true draws inside the frame and false centers on it. Omitted values retain inside placement.</summary>
    public HmiProperty<bool>? DrawStrokeInsideFrame { get; set; }

    /// <summary>A 32-bit selection mask; bit zero selects the first field. When set, this overrides SelectedIndex.</summary>
    public HmiProperty<uint>? SelectedFields { get; set; }

    public HmiCheckBoxGroup()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiCheckBoxGroup;
    }

}
