namespace BaseHmiTypes.Screens.Base;

public class HmiLayer : HmiModelBase
{
    public HmiProperty<bool> Visible { get; set; } = true;

    public HmiProperty<bool> RuntimeVisible { get; set; } = true;

    public HmiProperty<bool> Locked { get; set; } = false;

    public HmiProperty<double>? VisibilityMinZoom { get; set; }

    public HmiProperty<double>? VisibilityMaxZoom { get; set; }

    public IList<HmiScreenItemBase> Items { get; } = new List<HmiScreenItemBase>();
}
