namespace BaseHmiTypes.Screens.Controls;

public enum HmiAlarmStatusBarPanelType
{
    Unknown,
    ServerStatusConnected,
    ServerStatusDisconnected,
    EventList,
    AlarmQueue,
    InAlarmUnacknowledged,
    InAlarmAcknowledged,
    NormalUnacknowledged,
    AlarmFault,
    Filter,
    Sort
}
