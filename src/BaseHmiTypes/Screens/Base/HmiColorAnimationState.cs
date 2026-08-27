namespace BaseHmiTypes.Screens.Base;

public class HmiColorAnimationState
{
    public double? Value { get; set; }

    public HmiColorBehavior? ForegroundBehavior { get; set; }

    public HmiColor? ForegroundColor1 { get; set; }

    public HmiColor? ForegroundColor2 { get; set; }

    public HmiColorBehavior? BackgroundBehavior { get; set; }

    public HmiColor? BackgroundColor1 { get; set; }

    public HmiColor? BackgroundColor2 { get; set; }

    public int? FillColorMode { get; set; }

    public HmiColor? BackgroundEndColor { get; set; }

    public double? BackgroundGradientStop { get; set; }

    public string? BackgroundGradientAxis { get; set; }

    public HmiGradientDirection? BackgroundGradientDirection { get; set; }

    public HmiColor? FillEndColor { get; set; }

    public double? FillGradientStop { get; set; }

    public string? FillGradientAxis { get; set; }

    public HmiGradientDirection? FillGradientDirection { get; set; }
}
