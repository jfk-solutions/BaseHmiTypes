using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public enum HmiThresholdValueMode
{
    Absolute,
    Percentage
}

public sealed class HmiThreshold
{
    public int? Index { get; set; }

    public HmiProperty<double>? Value { get; set; }

    public HmiProperty<HmiColor>? Color { get; set; }

    public HmiProperty<bool>? Blink { get; set; }

    public HmiProperty<HmiColor>? EndColor { get; set; }

    public HmiProperty<double>? GradientStop { get; set; }

    public string? GradientAxis { get; set; }

    public HmiGradientDirection? GradientDirection { get; set; }
}
