using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiRadarChartCategory
{
    public int? Index { get; set; }

    public HmiMultilingualText? Name { get; set; }

    public HmiProperty<double>? Minimum { get; set; }

    public HmiProperty<double>? Maximum { get; set; }
}
