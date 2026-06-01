using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.TextGraphicLists;

public sealed class HmiGraphicList : IHmiObject
{
    public DateTime? LastModified { get; set; }

    public string? Name { get; set; }

    public HmiGraphicListMode Mode { get; set; }

    public HmiTextGraphicListKind Kind { get; set; } = HmiTextGraphicListKind.Hmi;

    public HmiListRangeType RangeType { get; set; }

    public HmiMultilingualText? Comment { get; set; }

    public IList<HmiGraphicListEntry> Entries { get; } = new List<HmiGraphicListEntry>();
}

public sealed class HmiGraphicListEntry
{
    public string? Name { get; set; }

    public int From { get; set; }

    public int To { get; set; }

    public bool Default { get; set; }

    public string? ImageName { get; set; }

    public HmiImageSource? Image { get; set; }
}

public enum HmiGraphicListMode
{
    Simple = 0,
    Enhanced = 1
}

public enum HmiTextGraphicListKind
{
   Hmi
}

public enum HmiListRangeType
{
    Decimal = 0,
    Binary = 1,
    Bit = 2
}
