using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiRadarChartDataPoint
{
    public int? CategoryIndex { get; set; }

    public string? CategoryName { get; set; }

    public string? Tag { get; set; }

    public HmiProperty<double>? ConstantValue { get; set; }

    public string? SourceValue { get; set; }
}
