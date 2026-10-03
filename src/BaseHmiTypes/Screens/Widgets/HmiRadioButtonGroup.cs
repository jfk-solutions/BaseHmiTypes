using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiRadioButtonGroup : HmiSelectionGroupBase
{
    /// <summary>True places the radio indicator to the right of its caption; false/omitted keeps it on the left.</summary>
    public HmiProperty<bool>? IndicatorOnRight { get; set; }

    /// <summary>For borders wider than one pixel, true draws inside the frame and false centers on it. Omitted values retain inside placement.</summary>
    public HmiProperty<bool>? DrawStrokeInsideFrame { get; set; }

    /// <summary>A 32-bit selection mask; a single set bit selects its field, zero selects none, and multiple set bits are invalid.</summary>
    public HmiProperty<uint>? SelectedFields { get; set; }

    public HmiRadioButtonGroup()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiRadioButtonGroup;
    }

}
