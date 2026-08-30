namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiAlarmSortCriterion
{
    public HmiAlarmColumnType Column { get; set; }

    public string? SourceColumn { get; set; }

    public HmiAlarmSortDirection Direction { get; set; }

    public string? SourceDirection { get; set; }
}
