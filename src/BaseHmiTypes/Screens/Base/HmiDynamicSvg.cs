namespace BaseHmiTypes.Screens.Base;

public class HmiDynamicSvg : HmiCustomWidgetContainer
{
    public HmiProperty<HmiDynamicSvgType>? SvgType { get; set; }

    public HmiProperty<HmiImageSource>? Image { get; set; }

    public IList<HmiDynamicSvgProperty> Properties { get; } = new List<HmiDynamicSvgProperty>();
}
