namespace BaseHmiTypes.Screens.Base;

public abstract class HmiLayoutContainerBase : HmiPaintedScreenItemBase
{
    public IList<HmiScreenItemBase> Items { get; } = new List<HmiScreenItemBase>();
}
