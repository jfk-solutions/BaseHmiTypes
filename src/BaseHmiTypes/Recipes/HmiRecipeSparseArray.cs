namespace BaseHmiTypes.Recipes;

/// <summary>Zero-based stored positions. Missing members require an explicit complete baseline.</summary>
public sealed class HmiRecipeSparseArray
{
    public int? Length { get; set; }
    public IDictionary<int, string?> Values { get; } = new Dictionary<int, string?>();
    public static IReadOnlyList<string> Resolve(HmiRecipeSparseArray patch, IReadOnlyList<string> baseline)
    {
        if (patch.Length is null || patch.Length < 1 || patch.Length > 1000000 || baseline is null || baseline.Count != patch.Length)
            throw new FormatException("Sparse recipe array requires a complete baseline");
        var result = baseline.ToArray();
        if (result.Any(value => value is null)) throw new FormatException("Sparse recipe baseline has missing members");
        foreach (var member in patch.Values)
        {
            if (member.Key < 0 || member.Key >= patch.Length || member.Value is null) throw new FormatException("Invalid or unavailable sparse recipe array member");
            result[member.Key] = member.Value;
        }
        return result;
    }
}
