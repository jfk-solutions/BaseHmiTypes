namespace BaseHmiTypes.Screens.Controls;

/// <summary>A named column configuration, such as a message list or statistics list.</summary>
public sealed class HmiAlarmColumnSet
{
    public string? Name { get; set; }
    public IList<HmiAlarmColumn> Columns { get; } = new List<HmiAlarmColumn>();
}
