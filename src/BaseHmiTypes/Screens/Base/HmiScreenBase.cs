namespace BaseHmiTypes.Screens.Base;

using BaseHmiTypes.Scripts;
using BaseHmiTypes.Common;

public abstract class HmiScreenBase : HmiScreenModelBase
{
    /// <summary>Explicit property omissions reported by a Unified engineering export.</summary>
    public List<string> UnifiedExportWarnings { get; } = [];

    /// <summary>Configured edge for a native slide-in resource; absent on ordinary screens.</summary>
    public HmiSlideInEdge? SlideInEdge { get; set; }
    /// <summary>Screen-level lifecycle and operator event actions.</summary>
    public List<HmiEventBinding> Events { get; } = [];

    /// <summary>Local keys override template keys with the same native input identity.</summary>
    public List<HmiDeviceKeyBinding> DeviceKeys { get; } = [];

    public HmiScreenKind Kind { get; set; } = HmiScreenKind.Screen;

    /// <summary>Producer API provenance, when known; never selects the XML contract.</summary>
    public string? EngineeringApiVersion { get; set; }

    public string? SourceFormat { get; set; }

    public byte[]? SourceData { get; set; }

    public Dictionary<string, string> SourceProperties { get; } = [];

    public int? Number { get; set; }

    public HmiProperty<HmiMultilingualText>? ToolTipText { get; set; }

    public HmiProperty<double> Width { get; set; } = 0;

    public HmiProperty<double> Height { get; set; } = 0;

    public HmiProperty<HmiColor>? BackgroundColor { get; set; }

    public HmiImageSource? BackgroundImage { get; set; }

    public HmiProperty<HmiBackgroundImageLayout>? BackgroundImageLayout { get; set; }

    public HmiProperty<HmiColor>? PatternColor { get; set; }

    public HmiProperty<HmiFillPattern>? FillPattern { get; set; }

    public HmiProperty<HmiFillPatternAlignment>? FillPatternAlignment { get; set; }

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
    public HmiProperty<bool>? Enabled { get; set; }

    public HmiProperty<HmiColor>? AlternateBackgroundColor { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? HorizontalAlignment { get; set; }

    public HmiProperty<HmiVerticalAlignment>? VerticalAlignment { get; set; }

    public HmiProperty<string>? BackgroundFillMode { get; set; }

    public HmiProperty<int>? GraphicStretchMode { get; set; }

}
