using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiProcessDiagnosisCriteriaAnalysisControl : HmiCompanionBase
{
    public HmiProperty<bool>? ShowGridLines { get; set; }
    public HmiProperty<bool>? ShowColumnHeadings { get; set; }
    public HmiProperty<HmiColor>? GridLineColor { get; set; }
    public HmiProperty<HmiColor>? AlternatingRowBackgroundColor { get; set; }

    public HmiProcessDiagnosisCriteriaAnalysisControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiProcessDiagnosisCriteriaAnalysisControl;
    }

}
