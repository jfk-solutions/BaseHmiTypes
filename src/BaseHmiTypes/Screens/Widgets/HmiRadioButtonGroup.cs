using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiRadioButtonGroup : HmiSelectionGroupBase
{
    /// <summary>A 32-bit selection mask; a single set bit selects its field, zero selects none, and multiple set bits are invalid.</summary>
    public HmiProperty<uint>? SelectedFields { get; set; }

    public HmiRadioButtonGroup()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiRadioButtonGroup;
    }

}
