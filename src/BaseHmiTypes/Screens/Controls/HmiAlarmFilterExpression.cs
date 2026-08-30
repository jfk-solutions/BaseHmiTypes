namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiAlarmFilterExpression
{
    public HmiAlarmFilterExpressionType Type { get; set; }

    public HmiAlarmFilterFieldType Field { get; set; }

    public string? SourceField { get; set; }

    public HmiAlarmFilterOperator Operator { get; set; }

    public string? SourceOperator { get; set; }

    public HmiAlarmFilterValueType ValueType { get; set; }

    public string? TextValue { get; set; }

    public double? NumericValue { get; set; }

    public bool? BooleanValue { get; set; }

    public string? SourceValue { get; set; }

    public IList<HmiAlarmFilterExpression> Children { get; } = new List<HmiAlarmFilterExpression>();
}
