namespace BaseHmiTypes.Screens.Controls;

/// <summary>Detached presentation data supplied by a runtime independently of PLC transport.</summary>
public sealed class HmiAlarmDisplayData
{
    public IReadOnlyList<string> SelectedKeys { get; set; } = Array.Empty<string>();
    public IReadOnlyList<HmiAlarmDisplayRow> Rows { get; set; } = Array.Empty<HmiAlarmDisplayRow>();
}
public sealed class HmiAlarmDisplayRow
{
    public string Key { get; set; } = "";
    public string Text { get; set; } = "";
    public bool Active { get; set; }
    public bool CanAcknowledge { get; set; }
    public bool Acknowledged { get; set; }
    public IReadOnlyDictionary<string, string> Cells { get; set; } = new Dictionary<string, string>();
}
