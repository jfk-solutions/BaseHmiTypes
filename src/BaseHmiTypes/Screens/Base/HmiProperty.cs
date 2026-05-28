namespace BaseHmiTypes.Screens.Base;

public enum HmiPropertyKind
{
    Static,
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

public abstract class HmiProperty<T>
{
    public abstract HmiPropertyKind Kind { get; }

    public virtual T? StaticValue { get; set; }

    public static implicit operator HmiProperty<T>(T? value)
    {
        return new HmiStaticProperty<T> { StaticValue = value };
    }
}

public sealed class HmiStaticProperty<T> : HmiProperty<T>
{
    public override HmiPropertyKind Kind => HmiPropertyKind.Static;
}

public sealed class HmiTagProperty<T> : HmiProperty<T>
{
    public override HmiPropertyKind Kind => HmiPropertyKind.Tag;

    public string? TagName { get; set; }
}

public sealed class HmiScriptProperty<T> : HmiProperty<T>
{
    public override HmiPropertyKind Kind => HmiPropertyKind.Script;

    public HmiScriptLanguage Language { get; set; } = HmiScriptLanguage.Unknown;

    public string? Script { get; set; }
}

public sealed class HmiExpressionProperty<T> : HmiProperty<T>
{
    public override HmiPropertyKind Kind => HmiPropertyKind.Expression;

    public string? Expression { get; set; }
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
