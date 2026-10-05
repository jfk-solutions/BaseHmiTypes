using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

/// <summary>A named column configuration, such as a message list or statistics list.</summary>
public sealed class HmiAlarmColumnSet
{
    public string? Name { get; set; }
    public HmiProperty<bool>? AllowSort { get; set; }
    public HmiProperty<bool>? AllowFilter { get; set; }
    public HmiProperty<bool>? AllowColumnReorder { get; set; }
    public HmiProperty<bool>? AllowColumnResize { get; set; }
    public HmiProperty<HmiColor>? BackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ForegroundColor { get; set; }
    public HmiProperty<HmiColor>? HeaderBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? HeaderForegroundColor { get; set; }
    public HmiProperty<HmiColor>? HeaderBorderColor { get; set; }
    public HmiFont? ContentFont { get; set; }
    public HmiFont? HeaderFont { get; set; }
    public IList<HmiAlarmColumn> Columns { get; } = new List<HmiAlarmColumn>();
}
