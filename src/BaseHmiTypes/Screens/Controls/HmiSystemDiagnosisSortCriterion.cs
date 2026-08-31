namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiSystemDiagnosisSortCriterion
{
    public HmiSystemDiagnosisColumnType Column { get; set; }

    public string? SourceColumn { get; set; }

    public HmiAlarmSortDirection Direction { get; set; }

    public string? SourceDirection { get; set; }
}
