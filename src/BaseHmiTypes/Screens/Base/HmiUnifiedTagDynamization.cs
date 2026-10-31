namespace BaseHmiTypes.Screens.Base;

/// <summary>Editable engineering settings independent of a binding's preview expression.</summary>
public sealed class HmiUnifiedTagDynamization
{
    public string? PropertyName { get; set; }
    public string? TagName { get; set; }
    public string? Address { get; set; }
    public string? DataType { get; set; }
    public string? PlcTag { get; set; }
    public bool? ReadOnly { get; set; }
    public bool? UseIndirectAddressing { get; set; }
    /// <summary>A non-null list reference identifies a ResourceList dynamization.</summary>
    public string? ResourceList { get; set; }
    public HmiUnifiedValueConverter? ValueConverter { get; set; }
}

public sealed class HmiUnifiedValueConverter
{
    public HmiUnifiedMappingTable? MappingTable { get; set; }
}

public sealed class HmiUnifiedMappingTable
{
    public string? ConditionType { get; set; }
    public IList<HmiUnifiedMappingEntry> Entries { get; } = new List<HmiUnifiedMappingEntry>();
}

/// <summary>Preserves ordered range/bit conditions, typed values and flashing independently.</summary>
public sealed class HmiUnifiedMappingEntry
{
    public string? RangeType { get; set; }
    public string? BitDynamizationType { get; set; }
    public object? From { get; set; }
    public object? To { get; set; }
    public ulong? Condition { get; set; }
    public ulong? Relevant { get; set; }
    public object? Value { get; set; }
    public object? AlternateValue { get; set; }
    public bool? Flashing { get; set; }
    public string? FlashingRate { get; set; }
}

public sealed class HmiInputBehavior
{
    public HmiProperty<bool>? AcceptOnDeactivated { get; set; }
    public HmiProperty<bool>? ClearOnActivate { get; set; }
    public HmiProperty<bool>? HiddenInput { get; set; }
}
