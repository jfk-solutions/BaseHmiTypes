using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public abstract class HmiShapeBase : HmiSimpleScreenItemBase
{
    public HmiProperty<HmiColor>? LineColor { get; set; }

    public HmiProperty<HmiColor>? AlternateLineColor { get; set; }

    public HmiProperty<double>? LineWidth { get; set; }

    public HmiProperty<int>? DashType { get; set; }

    public HmiProperty<int>? BackFillPattern { get; set; }

    public HmiProperty<HmiFillPattern>? FillPattern { get; set; }

    public HmiProperty<HmiColor>? TransparentColor { get; set; }

    public HmiProperty<bool>? UseTransparentColor { get; set; }

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
