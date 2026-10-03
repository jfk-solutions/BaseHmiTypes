using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Common;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiListBox : HmiSelectionGroupBase
{
    /// <summary>Selected entries as a 32-bit mask, with bit zero selecting the first entry. When absent, selection is by value.</summary>
    public HmiProperty<uint>? SelectedFields { get; set; }

    public HmiListBox()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiListBox;
    }

}
