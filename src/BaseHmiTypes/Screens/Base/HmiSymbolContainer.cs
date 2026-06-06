namespace BaseHmiTypes.Screens.Base;

public class HmiSymbolContainer : HmiCustomWidgetContainer
{
    public HmiSymbolContainer()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiSymbolContainer;
    }

    public HmiProperty<HmiSymbolFillColorMode>? FillColorMode { get; set; }

    public HmiProperty<HmiSymbolFlipMode>? Flip { get; set; }

    public HmiProperty<bool>? FixedAspectRatio { get; set; }

    public HmiProperty<HmiImageSource>? Image { get; set; }
}
