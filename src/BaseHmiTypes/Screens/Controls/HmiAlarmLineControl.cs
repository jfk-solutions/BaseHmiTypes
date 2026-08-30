using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiAlarmLineControl : HmiSimpleScreenItemBase
{
    public HmiAlarmLineControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiAlarmLineControl;
    }

    public HmiProperty<bool>? SuppressFlashing { get; set; }

    public HmiAlarmLineViewKind ViewKind { get; set; }

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

    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }

    public HmiProperty<string>? IconStyle { get; set; }

    public HmiProperty<HmiAlarmRowDoubleClickAction>? RowDoubleClickAction { get; set; }

    public HmiProperty<bool>? ShowBorder { get; set; }

    public HmiFont? StatusBarFont { get; set; }

    public HmiProperty<string>? StatusBarButtonSize { get; set; }

    public HmiProperty<bool>? ShowTooltips { get; set; }

    public HmiProperty<bool>? ShowStatusBar { get; set; }

    public HmiProperty<string>? AlarmAndEventSummaryCommand { get; set; }

    public HmiProperty<bool>? DisplayErrorsInDialog { get; set; }

    public HmiProperty<bool>? MaintainSelection { get; set; }

    public HmiProperty<bool>? ShowWaitingMessage { get; set; }

    public HmiProperty<bool>? AlarmBellEnabled { get; set; }

    public IList<HmiAlarmColumn> ColumnDefinitions { get; } = new List<HmiAlarmColumn>();

    public HmiProperty<HmiAlarmTimePrecision>? TimePrecision { get; set; }

    public HmiProperty<bool>? ShowTriggerValue { get; set; }

    public HmiProperty<bool>? ShowTriggerLabel { get; set; }

    public HmiProperty<bool>? ShowInactiveAlarms { get; set; }

    public HmiProperty<bool>? ShowAlarmState { get; set; }

    public HmiProperty<bool>? ShowAlarmTime { get; set; }

    public string? AlarmTimeFormat { get; set; }

    public IList<string> FilteredTriggers { get; } = new List<string>();
}
