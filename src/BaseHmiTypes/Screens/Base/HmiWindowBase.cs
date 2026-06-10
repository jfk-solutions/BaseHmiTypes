namespace BaseHmiTypes.Screens.Base;

public abstract class HmiWindowBase : HmiPaintedScreenItemBase
{
    public HmiProperty<HmiColor>? CaptionColor { get; set; }

    public HmiProperty<HmiColor>? CaptionBackgroundColor { get; set; }

    public HmiProperty<int>? BackFillPattern { get; set; }

    public HmiProperty<HmiFillPattern>? FillPattern { get; set; }

    public HmiProperty<int>? CornerRadius { get; set; }

    public HmiProperty<int>? CornerStyle { get; set; }

    public HmiProperty<int>? EdgeStyle { get; set; }

    public HmiProperty<HmiColor>? FirstGradientColor { get; set; }

    public HmiProperty<double>? FirstGradientOffset { get; set; }

    public HmiProperty<HmiColor>? MiddleGradientColor { get; set; }

    public HmiProperty<HmiColor>? SecondGradientColor { get; set; }

    public HmiProperty<double>? SecondGradientOffset { get; set; }

    public HmiProperty<bool>? UseFirstGradient { get; set; }

    public HmiProperty<bool>? UseSecondGradient { get; set; }

    public HmiProperty<bool>? UseDesignColorSchema { get; set; }

    public HmiProperty<bool>? UseDesignShadowSettings { get; set; }
}
