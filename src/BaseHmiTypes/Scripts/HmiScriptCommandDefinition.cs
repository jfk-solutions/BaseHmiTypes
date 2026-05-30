using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Scripts;

public sealed class HmiScriptCommandDefinition
{
    public string Key { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Category { get; set; }

    public HmiScriptLanguage Language { get; set; } = HmiScriptLanguage.Unknown;

    public Type CommandType { get; set; } = typeof(HmiScriptCommand);

    public IList<HmiScriptCommandParameterDefinition> Parameters { get; } = new List<HmiScriptCommandParameterDefinition>();
}

public sealed class HmiScriptCommandParameterDefinition
{
    public string Name { get; set; } = string.Empty;

    public string PropertyName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public HmiScriptCommandParameterDirection Direction { get; set; } = HmiScriptCommandParameterDirection.In;

    public IList<HmiScriptCommandParameterTypeDefinition> AcceptedTypes { get; } = new List<HmiScriptCommandParameterTypeDefinition>();
}

public sealed class HmiScriptCommandParameterTypeDefinition
{
    public string ObjectType { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? InitialValue { get; set; }

    public IList<string> ValueTypes { get; } = new List<string>();

    public IList<HmiScriptCommandSelectionEntryDefinition> SelectionEntries { get; } = new List<HmiScriptCommandSelectionEntryDefinition>();
}

public sealed class HmiScriptCommandSelectionEntryDefinition
{
    public string Value { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? ScriptConstant { get; set; }
}

public enum HmiScriptCommandParameterDirection
{
    In,
    Out,
    Return
}
