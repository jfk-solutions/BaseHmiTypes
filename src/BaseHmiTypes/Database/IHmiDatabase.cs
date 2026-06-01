namespace BaseHmiTypes.Database;

public interface IHmiDatabase : IAsyncDisposable
{
    ValueTask<IReadOnlyList<HmiDatabaseRow>> ReadTableAsync(
        string tableName,
        IReadOnlyList<string>? columns = null,
        CancellationToken cancellationToken = default);
}

public sealed class HmiDatabaseRow
{
    private readonly Dictionary<string, object?> values;

    public HmiDatabaseRow(IDictionary<string, object?> values)
    {
        this.values = new Dictionary<string, object?>(values, StringComparer.OrdinalIgnoreCase);
    }

    public object? this[string columnName] => values.TryGetValue(columnName, out var value) ? value : null;

    public IReadOnlyCollection<string> ColumnNames => values.Keys;

    public bool HasColumn(string columnName)
    {
        return values.ContainsKey(columnName);
    }

    public T? Get<T>(string columnName)
    {
        var value = this[columnName];
        if (value is null || value is DBNull)
            return default;

        if (value is T typed)
            return typed;

        var targetType = Nullable.GetUnderlyingType(typeof(T)) ?? typeof(T);
        return (T)Convert.ChangeType(value, targetType);
    }

    public Guid GetGuid(string columnName)
    {
        var value = this[columnName];
        return value switch
        {
            Guid guid => guid,
            string text => Guid.Parse(text),
            byte[] bytes => new Guid(bytes),
            IEnumerable<byte> bytes => new Guid(bytes.ToArray()),
            null or DBNull => throw new InvalidOperationException($"Column '{columnName}' is null and cannot be read as a GUID. Available columns: {string.Join(", ", values.Keys)}."),
            _ when TryGetGuidFromToByteArray(value, out var guid) => guid,
            _ => throw new InvalidOperationException($"Column '{columnName}' is not a GUID. Actual type: {value.GetType().FullName}.")
        };
    }

    public bool TryGetGuid(string columnName, out Guid guid)
    {
        var value = this[columnName];
        switch (value)
        {
            case Guid guidValue:
                guid = guidValue;
                return true;
            case string text when Guid.TryParse(text, out var parsed):
                guid = parsed;
                return true;
            case byte[] bytes when bytes.Length == 16:
                guid = new Guid(bytes);
                return true;
            case IEnumerable<byte> bytes when bytes.Count() == 16:
                guid = new Guid(bytes.ToArray());
                return true;
            case not null when TryGetGuidFromToByteArray(value, out var reflected):
                guid = reflected;
                return true;
            default:
                guid = default;
                return false;
        }
    }

    public byte[]? GetBytes(string columnName)
    {
        var value = this[columnName];
        return value switch
        {
            null or DBNull => null,
            byte[] bytes => bytes,
            _ => throw new InvalidOperationException($"Column '{columnName}' is not binary data.")
        };
    }

    private static bool TryGetGuidFromToByteArray(object value, out Guid guid)
    {
        var method = value.GetType().GetMethod("ToByteArray", Type.EmptyTypes);
        if (method?.ReturnType == typeof(byte[]))
        {
            guid = new Guid((byte[])method.Invoke(value, null)!);
            return true;
        }

        guid = default;
        return false;
    }
}
