using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Scripts;

public enum HmiActionKind
{
    CommandList,
    TextScript
}

public abstract class HmiAction
{
    public abstract HmiActionKind Kind { get; }
}

public sealed class HmiCommandListAction : HmiAction
{
    public override HmiActionKind Kind => HmiActionKind.CommandList;

    public IList<HmiScriptCommand> Commands { get; } = new List<HmiScriptCommand>();
}

public sealed class HmiTextScriptAction : HmiAction
{
    public override HmiActionKind Kind => HmiActionKind.TextScript;

    public HmiScriptLanguage Language { get; set; } = HmiScriptLanguage.Unknown;

    public string? SourceCode { get; set; }
}

