namespace BaseHmiTypes.Screens.Base;

public abstract class HmiTrendControlBase : HmiControlWindowBase
{
    public IList<HmiTrendPen> Pens { get; } = new List<HmiTrendPen>();

    public HmiProperty<double>? MinimumValue { get; set; }

    public HmiProperty<double>? MaximumValue { get; set; }

    public HmiProperty<HmiTrendChartStyle>? ChartStyle { get; set; }

    public HmiProperty<int>? XAxisPenNumber { get; set; }

    public HmiProperty<HmiTrendUpdateMode>? UpdateMode { get; set; }

    public HmiProperty<double>? RefreshRateMilliseconds { get; set; }

    public HmiProperty<double>? HeartbeatMilliseconds { get; set; }

    public HmiProperty<double>? DeadbandPercent { get; set; }

    public HmiProperty<HmiTrendTimeFormat>? TimeFormat { get; set; }

    public HmiProperty<HmiTrendNumericRadix>? NumericRadix { get; set; }

    public HmiProperty<HmiTrendDataPointConnection>? DataPointConnection { get; set; }

    public HmiProperty<bool>? DisplayMilliseconds { get; set; }

    public HmiProperty<bool>? DisplayPenIcons { get; set; }
}
