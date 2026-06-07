namespace BaseHmiTypes.Screens.Base;

public class HmiVisualStyle
{
    public HmiProperty<HmiColor>? ForegroundColor { get; set; }

    public HmiProperty<HmiColor>? AlternateForegroundColor { get; set; }

    public HmiProperty<HmiColor>? BackgroundColor { get; set; }

    public HmiProperty<HmiColor>? AlternateBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? BorderColor { get; set; }

    public HmiProperty<HmiColor>? BorderBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? AlternateBorderColor { get; set; }

    public HmiProperty<double>? BorderWidth { get; set; }

    public HmiProperty<int>? BorderStyle { get; set; }

    public HmiProperty<HmiColor>? LineColor { get; set; }

    public HmiProperty<HmiColor>? AlternateLineColor { get; set; }

    public HmiProperty<double>? LineWidth { get; set; }

    public HmiProperty<int>? DashType { get; set; }

    public HmiProperty<int>? BackFillPattern { get; set; }

    public HmiProperty<HmiFillPattern>? FillPattern { get; set; }

    public HmiProperty<int>? CornerRadius { get; set; }

    public HmiProperty<int>? CornerStyle { get; set; }

    public HmiProperty<int>? EdgeStyle { get; set; }

    public HmiProperty<HmiColor>? CaptionColor { get; set; }

    public HmiProperty<HmiColor>? CaptionBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? HeaderBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? HeaderForegroundColor { get; set; }

    public HmiProperty<HmiColor>? ContentBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? ContentForegroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }

    public HmiProperty<HmiColor>? EvenRowBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionBorderColor { get; set; }

    public HmiProperty<double>? SelectionBorderWidth { get; set; }

    public HmiProperty<HmiColor>? FocusColor { get; set; }

    public HmiProperty<double>? FocusWidth { get; set; }

    public HmiProperty<HmiColor>? LabelColor { get; set; }

    public HmiProperty<HmiColor>? ScaleBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? ScaleForegroundColor { get; set; }

    public HmiProperty<HmiColor>? TickColor { get; set; }

    public HmiProperty<HmiColor>? ThumbBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? ThumbForegroundColor { get; set; }

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

    public HmiThickness? Margin { get; set; }

    public HmiThickness? Padding { get; set; }

    public HmiFont? Font { get; set; }

    public HmiFont? HeaderFont { get; set; }

    public HmiFont? ContentFont { get; set; }

    public HmiFont? LabelFont { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? HorizontalAlignment { get; set; }

    public HmiProperty<HmiVerticalAlignment>? VerticalAlignment { get; set; }
}
