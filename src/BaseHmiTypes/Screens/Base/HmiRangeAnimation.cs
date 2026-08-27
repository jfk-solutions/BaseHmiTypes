namespace BaseHmiTypes.Screens.Base;

/// <summary>
/// Describes a linear animation that maps an input expression range to an output range.
/// </summary>
public class HmiRangeAnimation
{
    public string? Expression { get; set; }

    public HmiAnimationRangeSource? RangeSource { get; set; }

    public double? ExpressionMinimum { get; set; }

    public double? ExpressionMaximum { get; set; }

    public string? ExpressionMinimumTag { get; set; }

    public string? ExpressionMaximumTag { get; set; }

    public double? OutputMinimum { get; set; }

    public double? OutputMaximum { get; set; }

    public HmiRangeAnimationOutputUnit? OutputUnit { get; set; }
}
