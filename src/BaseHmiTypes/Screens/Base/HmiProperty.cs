namespace BaseHmiTypes.Screens.Base;

public enum HmiPropertyKind
{
    Static,
    Default,
    Tag,
    Script,
    Expression,
    Blink
}

public enum HmiScriptLanguage
{
    Unknown,
    C,
    VBScript,
    JavaScript
}

public enum HmiBlinkCondition
{
    Always,
    WhenTrue,
    WhenFalse
}

public enum HmiBlinkRate
{
    Default,
    Slow,
    Medium,
    Fast
}

public enum HmiTriggerKind
{
    Tag,
    Cycle,
    Event
}

public enum HmiTagTriggerMode
{
    ValueChange,
    RisingEdge,
    FallingEdge
}

public enum HmiValueConverterKind
{
    Unknown,
    Linear,
    Range,
    Expression,
    Script
}

public abstract class HmiProperty<T>
{
    public abstract HmiPropertyKind Kind { get; }

    public virtual T? StaticValue { get; set; }

    public static implicit operator HmiProperty<T>(T? value)
    {
        return new HmiStaticProperty<T> { StaticValue = value };
    }
}

public abstract class HmiDynamicProperty<T> : HmiProperty<T>
{
    public IList<HmiTrigger> Triggers { get; } = new List<HmiTrigger>();
}

public abstract class HmiTrigger
{
    public abstract HmiTriggerKind Kind { get; }

    public string? Name { get; set; }
}

public sealed class HmiTagTrigger : HmiTrigger
{
    public override HmiTriggerKind Kind => HmiTriggerKind.Tag;

    public IList<string> TagNames { get; } = new List<string>();

    public HmiTagTriggerMode Mode { get; set; } = HmiTagTriggerMode.ValueChange;
}

public sealed class HmiCycleTrigger : HmiTrigger
{
    public override HmiTriggerKind Kind => HmiTriggerKind.Cycle;

    public string? CycleName { get; set; }

    public int? CycleTime { get; set; }

    public string? CycleUnit { get; set; }
}

public sealed class HmiEventTrigger : HmiTrigger
{
    public override HmiTriggerKind Kind => HmiTriggerKind.Event;

    public string? EventName { get; set; }
}

public sealed class HmiValueConverter
{
    public HmiValueConverterKind Kind { get; set; } = HmiValueConverterKind.Unknown;

    public string? Name { get; set; }

    public string? Expression { get; set; }

    public HmiScriptLanguage Language { get; set; } = HmiScriptLanguage.Unknown;

    public string? Script { get; set; }

    public IDictionary<string, object?> Parameters { get; } = new Dictionary<string, object?>();
}

public sealed class HmiStaticProperty<T> : HmiProperty<T>
{
    public override HmiPropertyKind Kind => HmiPropertyKind.Static;
}

public sealed class HmiDefaultProperty<T> : HmiProperty<T>
{
    public override HmiPropertyKind Kind => HmiPropertyKind.Default;

    public string? ProfileName { get; set; }

    public string? PropertyName { get; set; }
}

public sealed class HmiTagProperty<T> : HmiDynamicProperty<T>
{
    public override HmiPropertyKind Kind => HmiPropertyKind.Tag;

    public string? TagName { get; set; }
}

public sealed class HmiScriptProperty<T> : HmiDynamicProperty<T>
{
    public override HmiPropertyKind Kind => HmiPropertyKind.Script;

    public HmiScriptLanguage Language { get; set; } = HmiScriptLanguage.Unknown;

    public string? Script { get; set; }
}

public sealed class HmiExpressionProperty<T> : HmiDynamicProperty<T>
{
    public override HmiPropertyKind Kind => HmiPropertyKind.Expression;

    public string? Expression { get; set; }

    public IList<HmiValueConverter> Converters { get; } = new List<HmiValueConverter>();
}

public sealed class HmiBlinkProperty<T> : HmiProperty<T>
{
    public override HmiPropertyKind Kind => HmiPropertyKind.Blink;

    public T? BlinkValue { get; set; }

    public HmiBlinkCondition Condition { get; set; } = HmiBlinkCondition.Always;

    public HmiBlinkRate Rate { get; set; } = HmiBlinkRate.Default;

    public string? ConditionTagName { get; set; }
}

public static class HmiProperty
{
    public static HmiStaticProperty<T> Static<T>(T? value)
    {
        return new HmiStaticProperty<T> { StaticValue = value };
    }

    public static HmiDefaultProperty<T> Default<T>(T? value, string? profileName = null, string? propertyName = null)
    {
        return new HmiDefaultProperty<T>
        {
            StaticValue = value,
            ProfileName = profileName,
            PropertyName = propertyName
        };
    }

    public static HmiTagProperty<T> Tag<T>(string tagName, T? fallbackValue = default)
    {
        return new HmiTagProperty<T> { TagName = tagName, StaticValue = fallbackValue };
    }

    public static HmiScriptProperty<T> Script<T>(string script, HmiScriptLanguage language, T? fallbackValue = default)
    {
        return new HmiScriptProperty<T> { Script = script, Language = language, StaticValue = fallbackValue };
    }

    public static HmiExpressionProperty<T> Expression<T>(string expression, T? fallbackValue = default)
    {
        return new HmiExpressionProperty<T> { Expression = expression, StaticValue = fallbackValue };
    }

    public static HmiBlinkProperty<T> Blink<T>(
        T? staticValue,
        T? blinkValue,
        HmiBlinkRate rate = HmiBlinkRate.Default,
        HmiBlinkCondition condition = HmiBlinkCondition.Always,
        string? conditionTagName = null)
    {
        return new HmiBlinkProperty<T>
        {
            StaticValue = staticValue,
            BlinkValue = blinkValue,
            Rate = rate,
            Condition = condition,
            ConditionTagName = conditionTagName
        };
    }
}

public static class HmiPropertyExtensions
{
    public static T? GetStaticValue<T>(this HmiProperty<T>? property)
    {
        return property == null ? default : property.StaticValue;
    }

    public static T GetStaticValueOrDefault<T>(this HmiProperty<T>? property, T defaultValue = default!)
    {
        return property == null ? defaultValue : property.StaticValue ?? defaultValue;
    }
}
