namespace BaseHmiTypes.Screens.Base;

public class HmiLayer : HmiModelBase
{
    public bool Visible { get; set; } = true;

    public bool Locked { get; set; }

    public IList<HmiScreenItemBase> Items { get; } = new List<HmiScreenItemBase>();
}
