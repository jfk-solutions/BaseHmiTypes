namespace BaseHmiTypes.Recipes;

public enum HmiRecipeValueKind { Null, Scalar, Map, Array, Binary, Reference, Unsupported, Recursive, DepthLimit }

/// <summary>Detached stored value tree; array positions do not imply PLC bounds.</summary>
public sealed class HmiRecipeStructuredValue
{
    public HmiRecipeValueKind Kind { get; set; }
    public string? SourceType { get; set; }
    public string? Value { get; set; }
    public HmiRecipeBinaryValue? Binary { get; set; }
    public HmiRecipeReference? Reference { get; set; }
    public IList<HmiRecipeStructuredEntry> Entries { get; } = new List<HmiRecipeStructuredEntry>();
    public IList<HmiRecipeStructuredValue> Items { get; } = new List<HmiRecipeStructuredValue>();
}

public sealed class HmiRecipeStructuredEntry
{
    public string Key { get; set; } = string.Empty;
    public HmiRecipeStructuredValue Value { get; set; } = new HmiRecipeStructuredValue();
}
