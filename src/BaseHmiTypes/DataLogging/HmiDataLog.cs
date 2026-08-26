namespace BaseHmiTypes.DataLogging;

public sealed class HmiDataLog : IHmiObject
{
    public string? Name { get; set; }

    public string? Comment { get; set; }

    public string? Version { get; set; }

    public string? StorageLocation { get; set; }

    public string? ConnectionName { get; set; }

    public HmiDataLogRetentionPolicy RetentionPolicy { get; } = new();

    public IList<HmiDataLogGroup> Groups { get; } = new List<HmiDataLogGroup>();

    public IList<HmiDataLogTag> Tags { get; } = new List<HmiDataLogTag>();
}

public sealed class HmiDataLogRetentionPolicy : IHmiObject
{
    public bool Enabled { get; set; }

    public double? Duration { get; set; }

    public string? Unit { get; set; }
}

public sealed class HmiDataLogGroup : IHmiObject
{
    public string? Id { get; set; }

    public string? Name { get; set; }

    public HmiDataLogTrigger Trigger { get; } = new();
}

public sealed class HmiDataLogTag : IHmiObject
{
    public string? Name { get; set; }

    public string? Tag { get; set; }

    public string? DataType { get; set; }

    public string? GroupId { get; set; }

    public string? GroupName { get; set; }

    public HmiDataLogTrigger Trigger { get; } = new();
}

public sealed class HmiDataLogTrigger : IHmiObject
{
    public HmiDataLogTriggerType Type { get; set; }

    public double? Interval { get; set; }

    public string? IntervalUnit { get; set; }

    public double? MaximumUpdateRate { get; set; }

    public string? MaximumUpdateRateUnit { get; set; }

    public HmiDataLogDeadbandMode DeadbandMode { get; set; }

    public double? DeadbandValue { get; set; }

    public double? Heartbeat { get; set; }

    public string? HeartbeatUnit { get; set; }
}

public enum HmiDataLogTriggerType
{
    Unknown,
    Periodic,
    OnChange,
    OnDemand
}

public enum HmiDataLogDeadbandMode
{
    Unknown,
    None,
    Percentage,
    Absolute
}
