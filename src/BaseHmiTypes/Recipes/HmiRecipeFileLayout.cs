namespace BaseHmiTypes.Recipes;

public sealed class HmiRecipeFilePathSegment
{
    public string? Member { get; set; }
    public int? Index { get; set; }
}
public sealed class HmiRecipeFileField
{
    public string Name { get; set; } = "";
    public IList<HmiRecipeFilePathSegment> Path { get; } = new List<HmiRecipeFilePathSegment>();
}

/// <summary>Explicit scalar leaf rows for detached structures and dense arrays. Never infers PLC bounds.</summary>
public static class HmiRecipeFileLayout
{
    private sealed class Node
    {
        internal HmiRecipeValueKind? Kind;
        internal string? Field;
        internal readonly Dictionary<object, Node> Children = new();
    }
    private static Node Schema(IReadOnlyList<HmiRecipeFileField> fields)
    {
        if (fields is null || fields.Count == 0 || fields.Count > 10000) throw new FormatException("Invalid recipe file layout");
        var root = new Node(); var names = new HashSet<string>(StringComparer.Ordinal);
        foreach (var field in fields)
        {
            if (string.IsNullOrEmpty(field.Name) || !names.Add(field.Name) || field.Path.Count == 0 || field.Path.Count > 32)
                throw new FormatException("Invalid or duplicate recipe file field");
            var node = root;
            foreach (var segment in field.Path)
            {
                if ((segment.Member is null) == (segment.Index is null) || segment.Member is not null && segment.Member.Length == 0 || segment.Index is not null && (segment.Index < 0 || segment.Index >= 10000))
                    throw new FormatException("Invalid recipe file path");
                var kind = segment.Member is not null ? HmiRecipeValueKind.Map : HmiRecipeValueKind.Array;
                object key = segment.Member is not null ? segment.Member : segment.Index!.Value;
                if (node.Field is not null || node.Kind is not null && node.Kind != kind) throw new FormatException("Conflicting recipe file paths");
                node.Kind = kind;
                if (!node.Children.TryGetValue(key, out var child)) { child = new Node(); node.Children[key] = child; }
                node = child;
            }
            if (node.Field is not null || node.Children.Count != 0) throw new FormatException("Conflicting recipe file paths");
            node.Kind = HmiRecipeValueKind.Scalar; node.Field = field.Name;
        }
        void Check(Node node)
        {
            if (node.Kind == HmiRecipeValueKind.Array) for (var i = 0; i < node.Children.Count; i++) if (!node.Children.ContainsKey(i)) throw new FormatException("Sparse recipe file array layout");
            foreach (var child in node.Children.Values) Check(child);
        }
        Check(root); return root;
    }
    public static IDictionary<string, string> Flatten(HmiRecipeStructuredValue value, IReadOnlyList<HmiRecipeFileField> fields)
    {
        var result = new Dictionary<string, string>(StringComparer.Ordinal);
        void Visit(Node node, HmiRecipeStructuredValue current)
        {
            if (current is null || current.Kind != node.Kind) throw new FormatException("Recipe file value shape mismatch");
            if (node.Field is not null)
            {
                if (current.Value is null || current.Entries.Count != 0 || current.Items.Count != 0) throw new FormatException("Recipe file leaf must be scalar text");
                result[node.Field] = current.Value; return;
            }
            if (node.Kind == HmiRecipeValueKind.Array)
            {
                if (current.Entries.Count != 0 || current.Items.Count != node.Children.Count) throw new FormatException("Recipe file array shape mismatch");
                foreach (var child in node.Children) Visit(child.Value, current.Items[(int)child.Key]);
            }
            else
            {
                if (current.Items.Count != 0 || current.Entries.Count != node.Children.Count) throw new FormatException("Recipe file structure shape mismatch");
                var entries = new Dictionary<string, HmiRecipeStructuredValue>(StringComparer.Ordinal);
                foreach (var entry in current.Entries) { if (entries.ContainsKey(entry.Key)) throw new FormatException("Recipe file structure shape mismatch"); entries[entry.Key] = entry.Value; }
                if (current.Items.Count != 0 || entries.Count != node.Children.Count) throw new FormatException("Recipe file structure shape mismatch");
                foreach (var child in node.Children) { if (!entries.TryGetValue((string)child.Key, out var item)) throw new FormatException("Recipe file structure shape mismatch"); Visit(child.Value, item); }
            }
        }
        Visit(Schema(fields), value); return result;
    }
    public static HmiRecipeStructuredValue Expand(IDictionary<string, string> values, IReadOnlyList<HmiRecipeFileField> fields)
    {
        var root = Schema(fields);
        if (values is null || values.Count != fields.Count || values.Keys.Any(name => !fields.Any(field => field.Name == name))) throw new FormatException("Recipe file leaf schema mismatch");
        HmiRecipeStructuredValue Visit(Node node)
        {
            var result = new HmiRecipeStructuredValue { Kind = node.Kind!.Value };
            if (node.Field is not null) { if (!values.TryGetValue(node.Field, out var value) || value is null) throw new FormatException("Recipe file leaf must be scalar text"); result.Value = value; }
            else if (node.Kind == HmiRecipeValueKind.Array) for (var i = 0; i < node.Children.Count; i++) result.Items.Add(Visit(node.Children[i]));
            else foreach (var child in node.Children) result.Entries.Add(new HmiRecipeStructuredEntry { Key = (string)child.Key, Value = Visit(child.Value) });
            return result;
        }
        return Visit(root);
    }
}
