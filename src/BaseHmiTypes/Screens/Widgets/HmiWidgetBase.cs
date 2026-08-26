using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public abstract class HmiWidgetBase : HmiSimpleScreenItemBase
{
    public HmiFont? Font { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? HorizontalAlignment { get; set; }

    public HmiProperty<HmiVerticalAlignment>? VerticalAlignment { get; set; }

    public HmiProperty<int>? TextWrapping { get; set; }

    public HmiProperty<int>? TextTrimming { get; set; }

    public HmiProperty<HmiColor>? FocusColor { get; set; }

    public HmiProperty<double>? FocusWidth { get; set; }

    public HmiProperty<int>? BackFillPattern { get; set; }

    public HmiProperty<HmiFillPattern>? FillPattern { get; set; }

    public HmiProperty<int>? CornerRadius { get; set; }

    public HmiProperty<int>? CornerStyle { get; set; }

    public HmiProperty<HmiLineStyle>? EdgeStyle { get; set; }

    public HmiProperty<HmiColor>? FirstGradientColor { get; set; }

    public HmiProperty<double>? FirstGradientOffset { get; set; }

    public HmiProperty<HmiColor>? MiddleGradientColor { get; set; }

    public HmiProperty<HmiColor>? SecondGradientColor { get; set; }

    public HmiProperty<double>? SecondGradientOffset { get; set; }

    public HmiProperty<bool>? UseFirstGradient { get; set; }

    public HmiProperty<bool>? UseSecondGradient { get; set; }

    public HmiProperty<HmiGradientDirection>? GradientDirection { get; set; }

    public HmiProperty<bool>? UseDesignColorSchema { get; set; }

    public HmiProperty<bool>? UseDesignShadowSettings { get; set; }
}
