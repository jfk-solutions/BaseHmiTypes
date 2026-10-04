using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiBar : HmiScaleWidgetBase
{
    public HmiBar()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiBar;
    }

    public HmiProperty<HmiBarFillStyle>? FillStyle { get; set; }

    public HmiProperty<HmiFillDirection>? FillDirection { get; set; }

    /// <summary>Position of OriginValue in percent of the bar, used only with UseAutoScaling. Valid preview positions are zero through 100.</summary>
    public HmiProperty<double>? OriginPositionPercent { get; set; }

    /// <summary>Transform of normalized values between BeginValue and EndValue. Automatic origin placement takes precedence.</summary>
    public HmiProperty<HmiBarValueMapping>? ValueMapping { get; set; }

    /// <summary>Use the color of the lowest enabled threshold strictly above the current value; otherwise retain the foreground color.</summary>
    public HmiProperty<bool>? UseThresholdFillColors { get; set; }

    /// <summary>Show a black end arrow when the raw value is strictly below this limit.</summary>
    public HmiProperty<double>? UnderflowLimit { get; set; }

    /// <summary>Show a black end arrow when the raw value is strictly above this limit.</summary>
    public HmiProperty<double>? OverflowLimit { get; set; }

    /// <summary>True places the scale right/below; false places it left/above. Omitted uses right/below.</summary>
    public HmiProperty<bool>? ScaleAfterBar { get; set; }

}

public enum HmiBarFillStyle
{
    Solid,
    Gradient
}

/// <summary>Range-normalized mappings, not logarithms or powers of the raw process value.</summary>
public enum HmiBarValueMapping
{
    Linear = 0,
    /// <summary>log10(1 + 100*r) / log10(101), where r is the normalized range position.</summary>
    NormalizedLogarithmic = 1,
    /// <summary>1 - log10(101 - 100*r) / log10(101).</summary>
    InverseNormalizedLogarithmic = 2,
    Quadratic = 5,
    Cubic = 6
}
