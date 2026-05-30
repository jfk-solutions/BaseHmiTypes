using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Scripts.Commands;

public sealed class HmiScriptCallCommand : HmiScriptCommand
{
    public const string Name = "CallScript";

    public override string CommandName => Name;

    public string? ScriptName { get; set; }

    public HmiScriptLanguage Language { get; set; } = HmiScriptLanguage.Unknown;

    public HmiScriptCallCommand()
    {
        AddArgument(nameof(ScriptName), "Script name", HmiScriptCommandParameterDirection.In);
    }
}

