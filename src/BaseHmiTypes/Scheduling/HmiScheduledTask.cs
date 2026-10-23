using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Scripts;
namespace BaseHmiTypes.Scheduling;

public sealed class HmiScheduledTask : IHmiObject
{
    public string? Id { get; set; }
    public string? Name { get; set; }
    public HmiMultilingualText? Comment { get; set; }
    public bool Enabled { get; set; } = true;
    public List<HmiTrigger> Triggers { get; } = [];
    /// <summary>Task actions use Update, or TimeExpired for native timer actions.</summary>
    public List<HmiEventBinding> Events { get; } = [];
    public List<string> UnsupportedTriggers { get; } = [];
}

public sealed class HmiCalendarTrigger : HmiTrigger
{
    public override HmiTriggerKind Kind => HmiTriggerKind.Calendar;
    /// <summary>Minutely, Hourly, Daily, Weekly, Monthly, Yearly or Once, in local wall-clock time.</summary>
    public string Schedule { get; set; } = "Daily";
    /// <summary>Optional DateTime tag supplying Daily time, Yearly date/time or Once date/time. Values are ISO 8601 instants.</summary>
    public string? TimeTag { get; set; }
    public int Hour { get; set; }
    public int Minute { get; set; }
    public int Second { get; set; }
    public int? Day { get; set; }
    public int? Month { get; set; }
    public int? Year { get; set; }
    /// <summary>Sunday = 0, Saturday = 6.</summary>
    public int? Weekday { get; set; }
}

public sealed class HmiAlarmTrigger : HmiTrigger
{
    public override HmiTriggerKind Kind => HmiTriggerKind.Alarm;
    public List<HmiAlarmTriggerCriterion> Criteria { get; } = [];
}
public sealed class HmiAlarmTriggerCriterion
{
    public string Attribute { get; set; } = "";
    public string Operator { get; set; } = "EqualTo";
    public string Value { get; set; } = "";
    /// <summary>Equivalent identifiers for mapped controller alarm classes.</summary>
    public List<string> Values { get; } = [];
    public string AndOrOperation { get; set; } = "AND";
}
