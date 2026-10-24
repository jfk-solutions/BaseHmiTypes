namespace BaseHmiTypes.Scripts;

/// <summary>A source field and its actions, including fields whose rendered object association is unresolved.</summary>
public sealed class HmiFieldOwner
{
    public string Id { get; set; } = string.Empty;
    public string? SourceFormat { get; set; }
    public byte[]? SourceData { get; set; }
    public Dictionary<string, string> SourceProperties { get; } = new();
    public List<HmiEventBinding> Events { get; } = new();
}
