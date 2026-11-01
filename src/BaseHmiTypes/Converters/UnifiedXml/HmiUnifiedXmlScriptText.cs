namespace BaseHmiTypes.Converters.UnifiedXml;

/// <summary>Readable XML uses LF; engineering script strings use CRLF.</summary>
internal static class HmiUnifiedXmlScriptText
{
    internal static bool IsScript(string? name) => name == "ScriptCode" || name == "GlobalDefinitionAreaScriptCode";
    internal static string ToXml(string value) => value.Replace("\r\n", "\n").Replace("\r", "\n");
    internal static string ToNative(string value) => ToXml(value).Replace("\n", "\r\n");
}
