namespace BaseHmiTypes.Screens.Base;

public abstract class HmiControlWindowBase : HmiWindowBase
{
    public HmiProperty<HmiColor>? HeaderBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? HeaderForegroundColor { get; set; }

    public HmiProperty<HmiColor>? ContentBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? ContentForegroundColor { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? ContentHorizontalAlignment { get; set; }

    public HmiProperty<HmiVerticalAlignment>? ContentVerticalAlignment { get; set; }

    public HmiFont? HeaderFont { get; set; }

    public HmiFont? ContentFont { get; set; }
}
