namespace BaseHmiTypes.Scripts;

public abstract class HmiScriptCommand
{
    private readonly List<HmiScriptCommandArgument> _arguments = new List<HmiScriptCommandArgument>();

    public abstract string CommandName { get; }

    public virtual string CommandKey => CommandName;

    public IList<HmiScriptCommandArgument> Arguments => _arguments;

    protected HmiScriptCommandArgument AddArgument(string propertyName, string parameterName, HmiScriptCommandParameterDirection direction)
    {
        var argument = new HmiScriptCommandArgument
        {
            PropertyName = propertyName,
            ParameterName = parameterName,
            Direction = direction
        };

        _arguments.Add(argument);
        return argument;
    }
}

public sealed class HmiScriptCommandArgument
{
    public string PropertyName { get; set; } = string.Empty;

    public string ParameterName { get; set; } = string.Empty;

    public HmiScriptCommandParameterDirection Direction { get; set; } = HmiScriptCommandParameterDirection.In;

    public HmiScriptArgumentValue? Value { get; set; }
}

public sealed class HmiScriptArgumentValue
{
    public HmiScriptArgumentSourceKind SourceKind { get; set; } = HmiScriptArgumentSourceKind.Unknown;

    public string? RawValue { get; set; }

    public object? Value { get; set; }

    public string? ObjectType { get; set; }

    public string? ValueType { get; set; }
}

public enum HmiScriptArgumentSourceKind
{
    Unknown,
    Constant,
    ObjectReference,
    Integer,
    Double,
    Enum,
    Text
}
