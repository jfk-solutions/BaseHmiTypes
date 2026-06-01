namespace BaseHmiTypes.Screens.Base;

public abstract class HmiScreenBase : HmiScreenModelBase
{
    public HmiScreenKind Kind { get; set; } = HmiScreenKind.Screen;

    public int? Number { get; set; }

    public HmiProperty<double> Width { get; set; } = 0;

    public HmiProperty<double> Height { get; set; } = 0;

    public HmiProperty<HmiCursorMode>? CursorMode { get; set; }

    public HmiProperty<HmiUpdateCycle>? UpdateCycle { get; set; }

    public IList<HmiLayer> Layers { get; } = new List<HmiLayer>();
}
