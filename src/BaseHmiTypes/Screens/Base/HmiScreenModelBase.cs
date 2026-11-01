namespace BaseHmiTypes.Screens.Base;

public abstract class HmiScreenModelBase : HmiModelBase
{
    public HmiUnifiedEngineeringObject? UnifiedEngineering { get; set; }
    public string HmiObjectType { get; set; } = BaseHmiTypes.Screens.Base.HmiObjectType.Unknown;
}
