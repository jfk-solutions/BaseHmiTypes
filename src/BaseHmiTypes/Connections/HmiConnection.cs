using BaseHmiTypes.Common;

namespace BaseHmiTypes.Connections;

public sealed class HmiConnection : IHmiObject
{
    public DateTime? LastModified { get; set; }

    public string? Name { get; set; }

    public HmiMultilingualText? Comment { get; set; }

    public int AlarmDisplayClasses { get; set; }

    public string? InterfaceType { get; set; }

    public bool Online { get; set; }

    public int PartnerId { get; set; }

    public string? PhysicId { get; set; }

    public string? PlcId { get; set; }

    public string? ProtocolId { get; set; }

    public string? ReceiveNcAlarms { get; set; }

    public bool ReceiveNcMessages { get; set; }

    public IList<HmiProtocolValue> ProtocolValues { get; } = new List<HmiProtocolValue>();
}

public sealed class HmiProtocolValue
{
    public string? Name { get; set; }

    public string? Value { get; set; }
}
