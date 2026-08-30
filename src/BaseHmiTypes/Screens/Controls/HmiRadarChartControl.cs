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
}
