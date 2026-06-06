using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiAlarmIndicator : HmiSimpleScreenItemBase
{
    public HmiAlarmIndicator()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiAlarmIndicator;
    }

    public HmiProperty<bool>? IsFlashingRequired { get; set; }

    public HmiProperty<HmiColor>? FlashingColor { get; set; }

    public HmiProperty<int>? FlashingRate { get; set; }

    public HmiProperty<int>? AlarmState { get; set; }

    public HmiProperty<int>? NoAlarmState { get; set; }

    public HmiProperty<int>? NumberOfAlarms { get; set; }

    public HmiProperty<IList<int>>? ShowAcknowledgedAlarmClasses { get; set; }

    public HmiProperty<IList<int>>? ShowPendingAlarmClasses { get; set; }
}
