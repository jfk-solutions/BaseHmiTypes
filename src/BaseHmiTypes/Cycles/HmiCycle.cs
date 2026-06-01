using BaseHmiTypes.Common;

namespace BaseHmiTypes.Cycles;

public sealed class HmiCycle : IHmiObject
{
    public DateTime? LastModified { get; set; }

    public string? Name { get; set; }

    public HmiMultilingualText? Comment { get; set; }

    public int ConsumerType { get; set; }

    public int CycleTime { get; set; }

    public string? CycleUnit { get; set; }

    public long FullCycleTime { get; set; }

    public int Number { get; set; }

    public bool StartAtStartingPoint { get; set; }

    public int StartingPointDay { get; set; }

    public int StartingPointHour { get; set; }

    public int StartingPointMinute { get; set; }

    public int StartingPointMonth { get; set; }

    public int StartingPointSecond { get; set; }

    public bool TriggerAtShutDown { get; set; }

    public bool TriggerAtStartUp { get; set; }
}
