using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiAlarmEventSubscription
{
    public string? Name { get; set; }

    public HmiProperty<bool>? IsDefault { get; set; }

    public IList<HmiAlarmEventPriority> Priorities { get; } = new List<HmiAlarmEventPriority>();

    public IList<string> SourcePriorities { get; } = new List<string>();

    public IList<string> Scopes { get; } = new List<string>();

    public IList<string> EventSources { get; } = new List<string>();
}
