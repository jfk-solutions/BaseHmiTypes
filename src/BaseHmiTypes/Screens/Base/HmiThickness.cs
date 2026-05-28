namespace BaseHmiTypes.Screens.Base;

public class HmiThickness
{
    public HmiProperty<double> Left { get; set; } = 0;

    public HmiProperty<double> Top { get; set; } = 0;

    public HmiProperty<double> Right { get; set; } = 0;

    public HmiProperty<double> Bottom { get; set; } = 0;
}
