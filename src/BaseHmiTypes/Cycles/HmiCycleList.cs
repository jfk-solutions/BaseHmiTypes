namespace BaseHmiTypes.Cycles;

public sealed class HmiCycleList : IHmiObject
{
    public DateTime? LastModified { get; set; }

    public string? Name { get; set; }

    public IList<HmiCycle> HmiCycles { get; } = new List<HmiCycle>();
}
