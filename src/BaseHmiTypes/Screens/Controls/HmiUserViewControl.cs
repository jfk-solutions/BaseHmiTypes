using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiUserViewControl : HmiLayoutContainerBase
{
    public HmiUserViewControl() => HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiUserViewControl;

    public HmiProperty<HmiColor>? HeaderBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? HeaderForegroundColor { get; set; }
    public HmiProperty<double>? HeaderBorderWidth { get; set; }
    public HmiProperty<HmiColor>? HeaderBorderColor { get; set; }
    public HmiProperty<HmiColor>? ContentBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ContentForegroundColor { get; set; }
    public HmiFont? HeaderFont { get; set; }
    public HmiFont? ContentFont { get; set; }

    public HmiProperty<bool>? ShowGridLines { get; set; }
    public HmiProperty<HmiColor>? GridLineColor { get; set; }
    public HmiProperty<HmiColor>? AlternatingRowBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }
}
