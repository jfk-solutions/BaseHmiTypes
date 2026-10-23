namespace BaseHmiTypes.Screens.Base;

public class HmiColorAnimationState
{
    public double? Value { get; set; }

    /// <summary>Inclusive lower bound for a range state; null retains exact Value matching.</summary>
    public double? MinimumValue { get; set; }

    /// <summary>Inclusive upper bound for a range state.</summary>
    public double? MaximumValue { get; set; }

    /// <summary>Optional bit selector; when present, bit matching replaces numeric range matching.</summary>
    public int? BitIndex { get; set; }

    /// <summary>Expected selected bit value; defaults to true when BitIndex is present.</summary>
    public bool? BitValue { get; set; }

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
