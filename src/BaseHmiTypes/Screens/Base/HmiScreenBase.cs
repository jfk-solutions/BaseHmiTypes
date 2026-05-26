namespace BaseHmiTypes.Screens.Base;

public abstract class HmiScreenBase : HmiScreenModelBase
{
    public IList<HmiLayer> Layers { get; } = new List<HmiLayer>();
}
