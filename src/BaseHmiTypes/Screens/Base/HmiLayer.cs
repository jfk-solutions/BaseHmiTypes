namespace BaseHmiTypes.Screens.Base;

public class HmiLayer : HmiModelBase
{
    public HmiProperty<bool> Visible { get; set; } = true;

    public HmiProperty<bool> Locked { get; set; } = false;

    public IList<HmiScreenItemBase> Items { get; } = new List<HmiScreenItemBase>();
}
