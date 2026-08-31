using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiRadarChartSeries
{
    public int? Index { get; set; }

    public HmiMultilingualText? Name { get; set; }

    public string? LineAndMarker { get; set; }

    public HmiProperty<HmiColor>? LineColor { get; set; }

    public HmiProperty<HmiColor>? FillColor { get; set; }

    public IList<HmiRadarChartDataPoint> DataPoints { get; } = new List<HmiRadarChartDataPoint>();
}
