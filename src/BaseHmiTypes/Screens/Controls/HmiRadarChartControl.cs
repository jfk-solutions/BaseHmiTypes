using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

/// <summary>
/// Represents a radar/spider chart control. Product-specific chart payloads can
/// remain attached through the inherited source-data fields until decoded.
/// </summary>
public class HmiRadarChartControl : HmiControlWindowBase
{
    public HmiRadarChartControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiRadarChartControl;
    }

    public HmiMultilingualText? Title { get; set; }

    public HmiProperty<int>? SeriesCount { get; set; }

    public HmiProperty<int>? CategoryCount { get; set; }

    public HmiProperty<HmiRadarShape>? RadarShape { get; set; }

    public string? SourceRadarShape { get; set; }

    public HmiProperty<HmiColor>? ChartBackgroundColor { get; set; }

    public HmiProperty<HmiLineStyle>? GridLineStyle { get; set; }

    public string? SourceGridLineStyle { get; set; }

    public HmiProperty<HmiColor>? GridLineColor { get; set; }

    public HmiProperty<HmiColor>? BandedColor { get; set; }

    public HmiProperty<bool>? ShowLegend { get; set; }

    public HmiProperty<HmiRadarLegendPosition>? LegendPosition { get; set; }

    public string? SourceLegendPosition { get; set; }

    public HmiProperty<int>? DecimalPlaces { get; set; }

    public HmiProperty<double>? RefreshRateSeconds { get; set; }

    public HmiFont? TitleFont { get; set; }

    public HmiFont? CategoryFont { get; set; }

    public HmiFont? LegendFont { get; set; }

    public HmiFont? DataLabelFont { get; set; }
}
