namespace BaseHmiTypes.Screens.Base;

public class HmiDynamicSvg : HmiCustomWidgetContainer
{
    public HmiProperty<HmiDynamicSvgType>? SvgType { get; set; }

    public HmiProperty<string>? ResourceId { get; set; }

    public HmiProperty<string>? ResourceName { get; set; }

    public HmiProperty<string>? ControlType { get; set; }

    public HmiProperty<string>? DisplayName { get; set; }

    public HmiProperty<string>? FileName { get; set; }

    public HmiProperty<string>? FilePath { get; set; }

    public HmiProperty<string>? HashCode { get; set; }

    public HmiProperty<string>? Version { get; set; }

    public HmiProperty<double>? DefaultWidth { get; set; }

    public HmiProperty<double>? DefaultHeight { get; set; }

    public IList<HmiDynamicSvgProperty> Properties { get; } = new List<HmiDynamicSvgProperty>();
}
