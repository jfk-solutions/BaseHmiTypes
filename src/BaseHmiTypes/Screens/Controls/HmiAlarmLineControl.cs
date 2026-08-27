using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiAlarmLineControl : HmiSimpleScreenItemBase
{
    public HmiAlarmLineControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiAlarmLineControl;
    }

    public HmiProperty<bool>? SuppressFlashing { get; set; }

    public HmiProperty<int>? AcknowledgmentFlashingRate { get; set; }

    public HmiProperty<int>? ResetFlashingRate { get; set; }

    public HmiProperty<int>? NumberOfRows { get; set; }

    public HmiFont? Font { get; set; }

    public HmiProperty<bool>? WordWrap { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? HorizontalAlignment { get; set; }

    public HmiProperty<bool>? UseAlarmColors { get; set; }

    public HmiProperty<bool>? MessageBlink { get; set; }

    public HmiProperty<bool>? UseAlarmIdentifier { get; set; }

    public HmiProperty<double>? AlarmIdentifier { get; set; }

    public HmiProperty<bool>? QueueNewAlarms { get; set; }

    public HmiProperty<bool>? ShowTriggerValue { get; set; }

    public HmiProperty<bool>? ShowTriggerLabel { get; set; }

    public HmiProperty<bool>? ShowInactiveAlarms { get; set; }

    public HmiProperty<bool>? ShowAlarmState { get; set; }

    public HmiProperty<bool>? ShowAlarmTime { get; set; }

    public string? AlarmTimeFormat { get; set; }

    public IList<string> FilteredTriggers { get; } = new List<string>();
}
