namespace BaseHmiTypes.Screens.Base;

public abstract class HmiLayoutContainerBase : HmiScreenItemBase
{
    public IList<HmiScreenItemBase> Items { get; } = new List<HmiScreenItemBase>();
}
