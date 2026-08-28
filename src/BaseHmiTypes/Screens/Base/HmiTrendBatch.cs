namespace BaseHmiTypes.Screens.Base;

public sealed class HmiTrendBatch
{
    public int? Id { get; set; }

    public bool? IsGolden { get; set; }

    public string? StartTime { get; set; }

    public string? EndTime { get; set; }

    public string? SelectionMode { get; set; }
}
