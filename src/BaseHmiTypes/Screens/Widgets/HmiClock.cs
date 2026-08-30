using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiClock : HmiWidgetBase
{
    public HmiClock()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiClock;
    }

    public HmiProperty<bool>? Analog { get; set; }

    public HmiProperty<int>? NumberStyle { get; set; }

    public HmiProperty<bool>? ShowDate { get; set; }

    public HmiProperty<bool>? ShowTime { get; set; }

    public HmiProperty<bool>? ShowHours { get; set; }

    public HmiProperty<bool>? ShowMinutes { get; set; }

    public HmiProperty<bool>? ShowSeconds { get; set; }

    /// <summary>
    /// Product-specific date/time display format retained without locale-dependent conversion.
    /// </summary>
    public HmiProperty<string>? Format { get; set; }

    public HmiProperty<string>? TimeZone { get; set; }
}
