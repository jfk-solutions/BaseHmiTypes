namespace BaseHmiTypes.Tags;

public sealed class HmiTag : IHmiObject
{
    public DateTime? LastModified { get; set; }

    public string? Name { get; set; }

    public string? DataType { get; set; }

    public string? NativeDataType { get; set; }

    public string? SourceType { get; set; }

    public string? Connection { get; set; }

    public string? PlcTag { get; set; }

    public string? Address { get; set; }

    public bool? ReadOnly { get; set; }

    public string? AccessRight { get; set; }

    public bool? Alarmed { get; set; }

    public bool? Retentive { get; set; }

    public string? SecurityCode { get; set; }

    public int? ExternalReferenceCount { get; set; }

    public string? ParentId { get; set; }

    public int? ParentType { get; set; }

    public string? InitialValue { get; set; }

    public double? MinimumValue { get; set; }

    public double? MaximumValue { get; set; }

    public double? Scale { get; set; }

    public double? Offset { get; set; }

    public string? Unit { get; set; }

    public string? OffLabel { get; set; }

    public string? OnLabel { get; set; }

    public int? StringLength { get; set; }

    public int? NativeValueType { get; set; }

    public string? ValueType { get; set; }

    public int? ElementSize { get; set; }

    public int? ElementCount { get; set; }

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
