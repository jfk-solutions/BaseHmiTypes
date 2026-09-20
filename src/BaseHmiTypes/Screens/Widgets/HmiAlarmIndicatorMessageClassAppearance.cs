using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiAlarmIndicatorMessageClassAppearance
{
    public int Index { get; set; }

    public HmiProperty<bool>? IsTextFlashingRequired { get; set; }

    public HmiProperty<bool>? IsBackgroundFlashingRequired { get; set; }
}
