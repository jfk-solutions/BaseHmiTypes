namespace BaseHmiTypes.Screens.Base;

public sealed class HmiTrendOverlay
{
    public string? SnapshotName { get; set; }

    public HmiProperty<HmiTrendOverlayAnchorType>? AnchorType { get; set; }

    public string? StartTime { get; set; }

    public HmiProperty<bool>? UseDefaultStartTime { get; set; }

    public HmiProperty<double>? OffsetPercent { get; set; }

    public HmiProperty<bool>? Visible { get; set; }

    public HmiProperty<int>? StartPenNumber { get; set; }

    public HmiProperty<int>? EndPenNumber { get; set; }
}
