namespace BaseHmiTypes.Screens.Base;

public abstract class HmiContainerBase : HmiWindowBase
{
    public IList<HmiScreenItemBase> Items { get; } = new List<HmiScreenItemBase>();
}
