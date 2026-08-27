namespace BaseHmiTypes.Screens.Base;

public abstract class HmiTrendControlBase : HmiControlWindowBase
{
    public IList<HmiTrendPen> Pens { get; } = new List<HmiTrendPen>();

    public HmiProperty<double>? MinimumValue { get; set; }

    public HmiProperty<double>? MaximumValue { get; set; }
}
