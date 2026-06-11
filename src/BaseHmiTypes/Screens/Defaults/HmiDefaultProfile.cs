using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Defaults;

public sealed class HmiDefaultProfile
{
    private static readonly Dictionary<Type, string[]> ObjectTypeKeyCache = new();
    private static readonly object ObjectTypeKeyCacheLock = new();

    private readonly Dictionary<HmiDefaultKey, object?> _values = new();

    public HmiDefaultProfile(string name)
    {
        Name = name;
    }

    public string Name { get; }

    public void Set<T>(string objectType, string propertyName, T? value)
    {
        _values[new HmiDefaultKey(objectType, propertyName)] = value;
    }

    public void Set<TItem, TValue>(string propertyName, TValue? value)
        where TItem : HmiScreenItemBase
    {
        Set(typeof(TItem).Name, propertyName, value);
    }

    public bool TryGet<T>(HmiScreenItemBase item, string propertyName, out T? value)
    {
        value = default;

        object? rawValue = null;
        var found = false;

        if (!string.IsNullOrWhiteSpace(item.HmiObjectType)
            && _values.TryGetValue(new HmiDefaultKey(item.HmiObjectType, propertyName), out rawValue))
        {
            found = true;
        }

        var objectTypeKeys = GetCachedObjectTypeKeys(item.GetType());
        for (var i = 0; !found && i < objectTypeKeys.Length; i++)
        {
            var objectType = objectTypeKeys[i];
            if (StringComparer.Ordinal.Equals(item.HmiObjectType, objectType))
                continue;

            found = _values.TryGetValue(new HmiDefaultKey(objectType, propertyName), out rawValue);
        }

        if (!found)
            return false;

        if (rawValue == null)
            return true;

        if (rawValue is T typedValue)
        {
            value = typedValue;
            return true;
        }

        return false;
    }

    private static string[] GetCachedObjectTypeKeys(Type itemType)
    {
        lock (ObjectTypeKeyCacheLock)
        {
            if (ObjectTypeKeyCache.TryGetValue(itemType, out var cachedKeys))
                return cachedKeys;

            var keys = new List<string>();
            for (var type = itemType; type != null && typeof(HmiScreenItemBase).IsAssignableFrom(type); type = type.BaseType)
                keys.Add(type.Name);

            cachedKeys = keys.ToArray();
            ObjectTypeKeyCache[itemType] = cachedKeys;
            return cachedKeys;
        }
    }

    private readonly struct HmiDefaultKey : IEquatable<HmiDefaultKey>
    {
        public HmiDefaultKey(string objectType, string propertyName)
        {
            ObjectType = objectType;
            PropertyName = propertyName;
        }

        public string ObjectType { get; }

        public string PropertyName { get; }

        public bool Equals(HmiDefaultKey other)
        {
            return StringComparer.Ordinal.Equals(ObjectType, other.ObjectType)
                && StringComparer.Ordinal.Equals(PropertyName, other.PropertyName);
        }

        public override bool Equals(object? obj)
        {
            return obj is HmiDefaultKey other && Equals(other);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return (StringComparer.Ordinal.GetHashCode(ObjectType) * 397)
                    ^ StringComparer.Ordinal.GetHashCode(PropertyName);
            }
        }
    }
}
