namespace BaseHmiTypes.Screens.Base;

public class HmiFillAnimation
{
    public string? Expression { get; set; }

    /// <summary>Gets or sets the static value used to preview a dynamic expression.</summary>
    public double? ExpressionFallback { get; set; }

    public HmiAnimationRangeSource? RangeSource { get; set; }

    public double? ExpressionMinimum { get; set; }

    public double? ExpressionMaximum { get; set; }

    public string? ExpressionMinimumTag { get; set; }

    public string? ExpressionMaximumTag { get; set; }

    public double? FillMinimum { get; set; }

    public double? FillMaximum { get; set; }

    public HmiFillDirection? Direction { get; set; }

    public bool? InsideOnly { get; set; }
}
