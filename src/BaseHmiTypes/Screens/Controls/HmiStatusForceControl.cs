using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiStatusForceControl : HmiControlWindowBase
{
    public HmiStatusForceControl() => HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiStatusForceControl;

    public HmiProperty<bool>? ShowGridLines { get; set; }
    public HmiProperty<HmiColor>? GridLineColor { get; set; }
    public HmiProperty<HmiColor>? AlternatingRowBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }
}
