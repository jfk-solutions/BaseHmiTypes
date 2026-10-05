using BaseHmiTypes.Common;

namespace BaseHmiTypes.TextGraphicLists;

public sealed class HmiTextList : IHmiObject
{
    public HmiTextListEntryReference? DefaultEntryReference { get; set; }
    public DateTime? LastModified { get; set; }

    public string? Name { get; set; }

    public HmiTextGraphicListKind Kind { get; set; } = HmiTextGraphicListKind.Hmi;

    public HmiListRangeType RangeType { get; set; }

    public HmiMultilingualText? Comment { get; set; }

    public IList<HmiTextListEntry> Entries { get; } = new List<HmiTextListEntry>();
}

public sealed class HmiTextListEntry
{
    public string? SourceId { get; set; }

    public HmiTextListEntryType? EntryType { get; set; }
    public string? Name { get; set; }

    public int From { get; set; }

    public int To { get; set; }

    public bool Default { get; set; }

    public HmiMultilingualText? Text { get; set; }
}

public sealed class HmiTextListEntryReference
{
    public string? SourceId { get; set; }
    public string? Name { get; set; }
}

public enum HmiTextListEntryType
{
    SingleValue = 0,
    Range = 1,
    To = 2,
    From = 3
}
