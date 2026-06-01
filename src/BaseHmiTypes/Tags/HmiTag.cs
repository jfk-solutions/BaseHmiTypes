namespace BaseHmiTypes.Tags;

public sealed class HmiTag : IHmiObject
{
    public string? Name { get; set; }

    public string? DataType { get; set; }

    public string? Connection { get; set; }

    public string? PlcTag { get; set; }

    public string? Address { get; set; }

    public string? RefreshType { get; set; }

    public string? RefreshTime { get; set; }

    public bool Multiplexing { get; set; }

    public string? IndexTag { get; set; }

    public string? Upper2 { get; set; }

    public string? Upper1 { get; set; }

    public string? Lower1 { get; set; }

    public string? Lower2 { get; set; }

    public bool LinearScaling { get; set; }

    public double ScalingPlcHigh { get; set; }

    public double ScalingPlcLow { get; set; }

    public double ScalingHmiHigh { get; set; }

    public double ScalingHmiLow { get; set; }

    public string? Comment { get; set; }

    public uint Crc { get; set; }

    public uint[]? LidPath { get; set; }

    public string? LidPathString => LidPath != null ? string.Join(".", LidPath.Select(x => (x & 0x0FFFFFFFu).ToString("x"))) : null;

    public uint Rid { get; set; }
}
