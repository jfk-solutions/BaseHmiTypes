using BaseHmiTypes.Common;
using BaseHmiTypes.Scripts;

namespace BaseHmiTypes.Screens;

/// <summary>A character-oriented screen containing ordered entries, rather than pixel-positioned controls.</summary>
public class HmiCharacterScreen : HmiScreen
{
    /// <summary>Physical character grid, when known. Null means unspecified.</summary>
    public int? Columns { get; set; }
    public int? Rows { get; set; }
    public IList<HmiCharacterScreenEntry> Entries { get; } = new List<HmiCharacterScreenEntry>();
    /// <summary>Imported field actions with source owner metadata. Hosts own field observation and dispatch.</summary>
    public IList<HmiEventBinding> FieldEvents { get; } = new List<HmiEventBinding>();
}

public class HmiCharacterScreenEntry
{
    public string Id { get; set; } = string.Empty;
    /// <summary>Plain text with significant spaces and LF line breaks. U+FFFC denotes an unresolved field.</summary>
    public HmiMultilingualText Text { get; set; } = new();
}
