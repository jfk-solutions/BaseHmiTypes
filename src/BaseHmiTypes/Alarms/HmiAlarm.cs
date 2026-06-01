using BaseHmiTypes.Common;

namespace BaseHmiTypes.Alarms;

public abstract class HmiAlarm : IHmiObject
{
    public DateTime? LastModified { get; set; }

    public string? Name { get; set; }
}

public sealed class HmiAlarmClass
{
    public string? Name { get; set; }

    public int Priority { get; set; }

    public bool Acknowledgement { get; set; }

    public override string ToString()
    {
        return Name + " (" + Priority + ")";
    }
}

public abstract class HmiBaseAlarm : HmiAlarm
{
    public int TiaAlarmId { get; set; }

    public int AlarmId { get; set; }

    public int Priority { get; set; }

    public HmiAlarmClass? AlarmClass { get; set; }

    public HmiMultilingualText? AlarmText { get; set; }

    public HmiMultilingualText? InfoText { get; set; }

    public HmiMultilingualText? AdditionalText1 { get; set; }
    public HmiMultilingualText? AdditionalText2 { get; set; }
    public HmiMultilingualText? AdditionalText3 { get; set; }
    public HmiMultilingualText? AdditionalText4 { get; set; }
    public HmiMultilingualText? AdditionalText5 { get; set; }
    public HmiMultilingualText? AdditionalText6 { get; set; }
    public HmiMultilingualText? AdditionalText7 { get; set; }
    public HmiMultilingualText? AdditionalText8 { get; set; }
    public HmiMultilingualText? AdditionalText9 { get; set; }

    public string? ProcessValueTag1 { get; set; }
    public string? ProcessValueTag2 { get; set; }
    public string? ProcessValueTag3 { get; set; }
    public string? ProcessValueTag4 { get; set; }
    public string? ProcessValueTag5 { get; set; }
    public string? ProcessValueTag6 { get; set; }
    public string? ProcessValueTag7 { get; set; }
    public string? ProcessValueTag8 { get; set; }
    public string? ProcessValueTag9 { get; set; }
    public string? ProcessValueTag10 { get; set; }

    public string? Area { get; set; }

    public string? Origin { get; set; }
}

public sealed class HmiDiscreteAlarm : HmiBaseAlarm
{
    public string? TriggerTag { get; set; }

    public int TriggerBitNumber { get; set; }

    public string? TriggerMode { get; set; }

    public string? AcknowledgementTag { get; set; }

    public int AcknowledgementBitNumber { get; set; }

    public string? PlcAcknowledgementTag { get; set; }

    public int PlcAcknowledgementBitNumber { get; set; }
}

public sealed class HmiAnalogAlarm : HmiBaseAlarm
{
    public string? LimitMode { get; set; }

    public string? LimitValueConstant { get; set; }
}

public sealed class HmiOpcUaAlarm : HmiAlarm
{
    public string? Area { get; set; }

    public string? ConditionTypeId { get; set; }

    public DateTime LastSyncTime { get; set; }

    public string? NotifyNodeId { get; set; }

    public string? Connection { get; set; }
}

public sealed class HmiSystemAlarm : HmiAlarm
{
    public int TiaAlarmId { get; set; }

    public int AlarmId { get; set; }

    public HmiAlarmClass? AlarmClass { get; set; }

    public HmiMultilingualText? AlarmText { get; set; }
}

public sealed class HmiAlarmList : IHmiObject
{
    public DateTime? LastModified { get; set; }

    public string? Name { get; set; }

    public HmiAlarmListType HmiAlarmListType { get; set; }

    public IList<HmiAlarm> Alarms { get; } = new List<HmiAlarm>();
}

public enum HmiAlarmListType
{
    Discrete,
    Analog,
    OpcUa,
    System
}
