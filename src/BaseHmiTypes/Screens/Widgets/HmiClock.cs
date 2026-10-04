using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiClock : HmiWidgetBase
{
    public HmiClock()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiClock;
    }

    public HmiProperty<bool>? Analog { get; set; }
    /// <summary>Preview background: 0 solid, 1 transparent frame around a filled analog dial,
    /// 2 transparent. Unset retains the default neutral dial outline.</summary>
    public HmiProperty<int>? BackgroundStyle { get; set; }

    public HmiProperty<bool>? ShowTicks { get; set; }
    public HmiProperty<HmiColor>? TicksColor { get; set; }
    public HmiProperty<HmiColor>? HandFillColor { get; set; }
    public HmiProperty<bool>? OutlinedHands { get; set; }

    /// <summary>Hand length as a percentage of the dial radius. Preview defaults: 50, 70, 80.</summary>
    public HmiProperty<double>? HourHandLengthPercent { get; set; }
    public HmiProperty<double>? MinuteHandLengthPercent { get; set; }
    public HmiProperty<double>? SecondHandLengthPercent { get; set; }

    /// <summary>Hand half-width as a percentage of its length. Preview defaults: 10, 8, 2.</summary>
    public HmiProperty<double>? HourHandHalfWidthPercent { get; set; }
    public HmiProperty<double>? MinuteHandHalfWidthPercent { get; set; }
    public HmiProperty<double>? SecondHandHalfWidthPercent { get; set; }

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
