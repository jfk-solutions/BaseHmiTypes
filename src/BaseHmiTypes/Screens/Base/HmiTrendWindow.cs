namespace BaseHmiTypes.Screens.Base;

/// <summary>A separately laid out plotting window within a trend control.</summary>
public sealed class HmiTrendWindow
{
    public string? Name { get; set; }
    public HmiProperty<bool>? Visible { get; set; }
    public HmiProperty<int>? SpacePortion { get; set; }
    public HmiProperty<bool>? XAxisGridVisible { get; set; }
    public HmiProperty<bool>? YAxisGridVisible { get; set; }
    public HmiProperty<bool>? MajorGridVisible { get; set; }
    public HmiProperty<HmiColor>? MajorGridColor { get; set; }
    public HmiProperty<bool>? MinorGridVisible { get; set; }
    public HmiProperty<HmiColor>? MinorGridColor { get; set; }
    public HmiProperty<bool>? GridInTrendColor { get; set; }
    public HmiProperty<bool>? UseGraphicValueBar { get; set; }
    public HmiProperty<HmiColor>? ValueBarColor { get; set; }
    public HmiProperty<double>? ValueBarWidth { get; set; }
    public HmiProperty<bool>? UseGraphicStatisticRulers { get; set; }
    public HmiProperty<HmiColor>? StatisticRulerColor { get; set; }
    public HmiProperty<double>? StatisticRulerWidth { get; set; }
}
