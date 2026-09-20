using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiSlider : HmiBar
{
    public HmiSlider()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiSlider;
    }

    public HmiProperty<HmiColor>? ThumbBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? ThumbForegroundColor { get; set; }

    public HmiProperty<HmiColor>? TrackHighBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? TrackLowBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? HighStopColor { get; set; }

    public HmiProperty<HmiColor>? LowStopColor { get; set; }
}
