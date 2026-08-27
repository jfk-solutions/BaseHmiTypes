namespace BaseHmiTypes.Screens.Widgets;

/// <summary>
/// Describes a predefined runtime operation requested by a button.
/// Parsers expose the operation as configuration only and must not execute it.
/// </summary>
public enum HmiButtonOperation
{
    PrintDisplay,
    ReturnToPreviousDisplay,
    CloseDisplay,
    ShutdownApplication,
    EnterConfigurationMode,
    ClearDiagnostics,
    ClearAllDiagnostics,
    ClearAlarmBanner,
    ClearAlarmHistory,
    SilenceAlarms,
    AcknowledgeAlarm,
    AcknowledgeAllAlarms,
    AlarmStatusMode,
    PrintAlarmHistory,
    PrintAlarmStatus,
    ResetAlarmStatus,
    SortAlarms,
    AcknowledgeInformation
}
