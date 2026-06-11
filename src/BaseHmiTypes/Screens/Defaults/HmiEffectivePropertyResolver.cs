using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Defaults;

public sealed class HmiEffectivePropertyResolver
{
    public HmiEffectivePropertyResolver(HmiDefaultProfile? defaultProfile = null)
    {
        DefaultProfile = defaultProfile ?? HmiDefaultProfiles.Empty;
    }

    public HmiDefaultProfile DefaultProfile { get; }

    public HmiProperty<T>? Resolve<T>(HmiScreenItemBase item, string propertyName, HmiProperty<T>? property)
    {
        if (property != null)
            return property;

        return DefaultProfile.TryGet<T>(item, propertyName, out var defaultValue)
            ? HmiProperty.Default(defaultValue, DefaultProfile.Name, propertyName)
            : null;
    }

    public bool TryGetStaticValue<T>(HmiScreenItemBase item, string propertyName, HmiProperty<T>? property, out T value)
    {
        value = default!;
        var resolved = Resolve(item, propertyName, property);
        if (resolved == null)
            return false;

        object? staticValue = resolved.StaticValue;
        if (staticValue == null)
            return false;

        value = (T)staticValue;
        return true;
    }
}
