namespace BaseHmiTypes.Connections;

public sealed class HmiConnectionList : IHmiObject
{
    public DateTime? LastModified { get; set; }

    public string? Name { get; set; }

    public IList<HmiConnection> Connections { get; } = new List<HmiConnection>();
}
