using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

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

    public int? TriggerValue { get; set; }

    public string? TriggerReference { get; set; }

    public string? TriggerLabel { get; set; }

    public bool? UseAcknowledgeAll { get; set; }

    public int? AcknowledgeAllValue { get; set; }

    public string? HandshakeTag { get; set; }

    public string? RemoteAcknowledgeExpression { get; set; }

    public string? RemoteAcknowledgeHandshakeTag { get; set; }

    public string? MessageTag { get; set; }

    public string? MessageNotificationTag { get; set; }

    public string? MessageHandshakeExpression { get; set; }

    public HmiColor? BackgroundColor { get; set; }

    public HmiColor? ForegroundColor { get; set; }

    public bool? AudioEnabled { get; set; }

    public bool? DisplayEnabled { get; set; }

    public bool? PrintEnabled { get; set; }

    public bool? WriteMessageToTag { get; set; }
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

    public int? HistorySize { get; set; }

    public int? HoldTimeMilliseconds { get; set; }

    public double? MaximumUpdateRateSeconds { get; set; }

    public string? SilenceTag { get; set; }

    public string? RemoteSilenceExpression { get; set; }

    public string? RemoteAcknowledgeAllExpression { get; set; }

    public string? StatusResetTag { get; set; }

    public string? RemoteStatusResetExpression { get; set; }

    public string? CloseDisplayTag { get; set; }

    public string? RemoteCloseDisplayExpression { get; set; }

    public bool? UseAlarmIdentifier { get; set; }
}

public enum HmiAlarmListType
{
    Discrete,
    Analog,
    OpcUa,
    System
}
