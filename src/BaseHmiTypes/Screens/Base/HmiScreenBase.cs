namespace BaseHmiTypes.Screens.Base;

public abstract class HmiScreenBase : HmiScreenModelBase
{
    public HmiScreenKind Kind { get; set; } = HmiScreenKind.Screen;

    public string? SourceFormat { get; set; }

    public byte[]? SourceData { get; set; }

    public Dictionary<string, string> SourceProperties { get; } = [];

    public int? Number { get; set; }

    public HmiProperty<double> Width { get; set; } = 0;

    public HmiProperty<double> Height { get; set; } = 0;

    public HmiProperty<HmiColor>? BackgroundColor { get; set; }

    public HmiProperty<HmiColor>? FirstGradientColor { get; set; }

    public HmiProperty<double>? FirstGradientOffset { get; set; }

    public HmiProperty<HmiColor>? MiddleGradientColor { get; set; }

    public HmiProperty<HmiColor>? SecondGradientColor { get; set; }

    public HmiProperty<double>? SecondGradientOffset { get; set; }

    public HmiProperty<bool>? UseFirstGradient { get; set; }

    public HmiProperty<bool>? UseSecondGradient { get; set; }

    public HmiProperty<HmiGradientDirection>? GradientDirection { get; set; }

    public HmiProperty<HmiColor>? RasterColor { get; set; }

    public HmiProperty<string>? TemplateId { get; set; }

    public HmiProperty<string>? TemplateName { get; set; }

    public HmiProperty<HmiCursorMode>? CursorMode { get; set; }

    public HmiProperty<HmiUpdateCycle>? UpdateCycle { get; set; }

    public HmiScreenRuntimeSettings? RuntimeSettings { get; set; }

    public IList<HmiScreenParameter> Parameters { get; } = new List<HmiScreenParameter>();

    public IList<HmiLayer> Layers { get; } = new List<HmiLayer>();
}
