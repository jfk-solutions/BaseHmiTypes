namespace BaseHmiTypes.Screens.Controls;

/// <summary>Alarm source selection, matching the Unified engineering catalog.</summary>
public enum HmiAlarmSourceType
{
    NotConfigured = 0,
    ActiveAlarms = 1,
    LoggedAlarms = 2,
    LoggedAlarmsUpdated = 3,
    AlarmDefinition = 4,
    AlarmStatistics = 5
}
