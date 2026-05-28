using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiClock : HmiWidgetBase
{
    public HmiProperty<bool>? ShowDate { get; set; }

    public HmiProperty<bool>? ShowTime { get; set; }

    public HmiProperty<bool>? ShowHours { get; set; }

    public HmiProperty<bool>? ShowMinutes { get; set; }

    public HmiProperty<bool>? ShowSeconds { get; set; }

    public HmiProperty<string>? TimeZone { get; set; }
}
