using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public enum HmiThresholdValueMode
{
    Absolute,
    Percentage
}

public sealed class HmiThreshold
{
    public HmiProperty<double>? Value { get; set; }

    public HmiProperty<HmiColor>? Color { get; set; }

    public HmiProperty<bool>? Blink { get; set; }
}
