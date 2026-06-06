namespace BaseHmiTypes.Screens.Base;

public class HmiDynamicSvg : HmiCustomWidgetContainer
{
    public HmiDynamicSvg()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiDynamicSvg;
    }

    public HmiProperty<HmiDynamicSvgType>? SvgType { get; set; }

    public HmiProperty<HmiImageSource>? Image { get; set; }

    public IList<HmiDynamicSvgProperty> Properties { get; } = new List<HmiDynamicSvgProperty>();
}
