namespace BaseHmiTypes.Screens.Base;

public abstract class HmiScreenModelBase : HmiModelBase
{
    public string HmiObjectType { get; set; } = BaseHmiTypes.Screens.Base.HmiObjectType.Unknown;
}
