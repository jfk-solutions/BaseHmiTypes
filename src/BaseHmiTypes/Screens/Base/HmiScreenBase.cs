namespace BaseHmiTypes.Screens.Base;

public abstract class HmiScreenBase : HmiScreenModelBase
{
    public HmiProperty<double> Width { get; set; } = 0;

    public HmiProperty<double> Height { get; set; } = 0;

    public IList<HmiLayer> Layers { get; } = new List<HmiLayer>();
}
