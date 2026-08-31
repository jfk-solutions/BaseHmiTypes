using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiSystemDiagnosisControl : HmiControlWindowBase
{
    public HmiSystemDiagnosisControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiSystemDiagnosisControl;
    }

    public HmiSystemDiagnosisViewKind ViewKind { get; set; }

    public HmiProperty<bool>? WrapAround { get; set; }

    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }
}
