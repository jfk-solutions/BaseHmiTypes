using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Scripts;

public enum HmiScriptType
{
    None,
    Sub,
    Function
}

public sealed class HmiScript : IHmiObject
{
    public DateTime? LastModified { get; set; }

    public string? Name { get; set; }

    public HmiMultilingualText? Comment { get; set; }

    public HmiScriptLanguage Language { get; set; } = HmiScriptLanguage.Unknown;

    public string? SourceCode { get; set; }

    public string? PreCode { get; set; }

    public HmiScriptType ScriptType { get; set; } = HmiScriptType.None;
}
