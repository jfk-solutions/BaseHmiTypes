using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiOverviewParameterControl : HmiParameterControlBase
{
    public HmiOverviewParameterControl() => HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiOverviewParameterControl;
    public HmiProperty<string>? Filter { get; set; }
}
