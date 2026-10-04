using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Common;

namespace BaseHmiTypes.Screens.Controls;

public class HmiDetailedParameterControl : HmiParameterControlBase
{
    public HmiDetailedParameterControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiDetailedParameterControl;
    }

    public HmiProperty<bool>? ParameterSetTypeFixed { get; set; }
    public HmiProperty<uint>? CurrentParameterSetId { get; set; }
    public HmiProperty<uint>? CurrentParameterSetTypeId { get; set; }
    public HmiProperty<HmiMultilingualText>? ParameterSetTypeLabel { get; set; }
    public HmiProperty<HmiMultilingualText>? ParameterSetLabel { get; set; }
    public HmiProperty<HmiMultilingualText>? NumberLabel { get; set; }
    public HmiProperty<bool>? HideDetails { get; set; }
}
