using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiProcessDiagnosisGraphOverviewControl : HmiControlWindowBase
{
    public string? AssociatedGraphDbTagSourceId { get; set; }
    public string? AssociatedGraphDbTagName { get; set; }

    public HmiProcessDiagnosisGraphOverviewControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiProcessDiagnosisGraphOverviewControl;
    }

}
