using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiBar : HmiScaleWidgetBase
{
    public HmiBar()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiBar;
    }

    public HmiProperty<HmiBarFillStyle>? FillStyle { get; set; }

    /// <summary>Eight top-to-bottom bitmap rows as 16 hexadecimal characters, MSB left. Zero bits use PatternColor; one bits use the value-region color. Tiles are anchored to the containing screen.</summary>
    public HmiProperty<string>? BitmapPatternRows { get; set; }

    /// <summary>GDI+ HatchStyle index 0 through 52, used with HatchPattern. Hatch spacing is eight device pixels, not scaled logical pixels. Invalid indices paint no value region.</summary>
    public HmiProperty<int>? HatchStyle { get; set; }

    /// <summary>Color of the unfilled bar track, independent of the widget background. Omitted retains the background-based track.</summary>
    public HmiProperty<HmiColor>? TrackColor { get; set; }

    /// <summary>Color of the value region, independent of widget foreground. Disabled and threshold fill colors take precedence; omitted inherits foreground.</summary>
    public HmiProperty<HmiColor>? FillColor { get; set; }

    public HmiProperty<HmiFillDirection>? FillDirection { get; set; }

    /// <summary>Position of OriginValue in percent of the bar, used only with UseAutoScaling. Valid preview positions are zero through 100.</summary>
    public HmiProperty<double>? OriginPositionPercent { get; set; }

    /// <summary>Transform of normalized values between BeginValue and EndValue. Automatic origin placement takes precedence.</summary>
    public HmiProperty<HmiBarValueMapping>? ValueMapping { get; set; }

    /// <summary>Pivot in normalized percentage units for Tangent mapping. Omitted uses the normalized OriginValue, or 50 when there is no origin.</summary>
    public HmiProperty<double>? TangentPivotPercent { get; set; }

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
    Gradient,
    /// <summary>Paint no value-region color; retain track, scale, thresholds, arrows and meter value.</summary>
    Transparent,
    BitmapPattern,
    HatchPattern
}

/// <summary>Range-normalized mappings, not logarithms or powers of the raw process value.</summary>
public enum HmiBarValueMapping
{
    Linear = 0,
    /// <summary>log10(1 + 100*r) / log10(101), where r is the normalized range position.</summary>
    NormalizedLogarithmic = 1,
    /// <summary>1 - log10(101 - 100*r) / log10(101).</summary>
    InverseNormalizedLogarithmic = 2,
    Tangent = 4,
    Quadratic = 5,
    Cubic = 6
}
