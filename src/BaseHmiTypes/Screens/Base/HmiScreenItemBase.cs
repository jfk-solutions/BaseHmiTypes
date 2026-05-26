namespace BaseHmiTypes.Screens.Base;

public abstract class HmiScreenItemBase : HmiScreenModelBase
{
    public double X { get; set; }

    public double Y { get; set; }

    public double Width { get; set; }

    public double Height { get; set; }

    public bool Visible { get; set; } = true;
}
