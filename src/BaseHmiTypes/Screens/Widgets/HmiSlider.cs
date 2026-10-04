using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiSlider : HmiBar
{
    public HmiSlider()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiSlider;
    }

    public HmiProperty<HmiColor>? ThumbBackgroundColor { get; set; }

    /// <summary>Foreground of the thumb. The HTML preview uses it for the thumb outline.</summary>
    public HmiProperty<HmiColor>? ThumbForegroundColor { get; set; }

    /// <summary>Configured small-change increment; preview rendering does not perform process writes.</summary>
    public HmiProperty<int>? StepSize { get; set; }

    public HmiProperty<HmiColor>? TrackHighBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? TrackLowBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? HighStopColor { get; set; }

    public HmiProperty<HmiColor>? LowStopColor { get; set; }
}
