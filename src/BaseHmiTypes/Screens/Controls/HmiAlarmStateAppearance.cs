using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiAlarmStateAppearance
{
    public HmiAlarmStateAppearanceType Type { get; set; }

    public string? SourceType { get; set; }

    public HmiProperty<HmiColor>? ForegroundColor { get; set; }

    public HmiProperty<HmiColor>? BackgroundColor { get; set; }

    public HmiProperty<bool>? Blink { get; set; }

    public HmiProperty<bool>? ShowEventType { get; set; }

    public HmiProperty<bool>? AudioEnabled { get; set; }

    public string? AudioSource { get; set; }

    public string? AudioStatusTag { get; set; }
}
