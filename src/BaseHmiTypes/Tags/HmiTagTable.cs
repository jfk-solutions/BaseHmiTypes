namespace BaseHmiTypes.Tags;

public sealed class HmiTagTable : IHmiObject
{
    public DateTime? LastModified { get; set; }

    public string? Name { get; set; }

    public IList<HmiTag> Tags { get; } = new List<HmiTag>();
}
