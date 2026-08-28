namespace BaseHmiTypes.Screens.Base;

/// <summary>
/// Describes a writable slider animation that maps object movement to a tag value.
/// </summary>
public class HmiSliderAnimation
{
    public string? Tag { get; set; }

    public HmiAnimationRangeSource? RangeSource { get; set; }

    public double? TagMinimum { get; set; }

    public double? TagMaximum { get; set; }

    public string? MinimumTag { get; set; }

    public string? MaximumTag { get; set; }

    public double? OffsetMinimum { get; set; }

    public double? OffsetMaximum { get; set; }
}
