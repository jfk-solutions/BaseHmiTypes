namespace BaseHmiTypes.Screens.Base;

public class HmiFaceplateType : HmiScreenBase
{
    public HmiFaceplateType()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiFaceplateType;
        Kind = HmiScreenKind.Faceplate;
    }

    public string? Version { get; set; }

    public IList<HmiFaceplateInterfaceMember> InterfaceProperties { get; } = new List<HmiFaceplateInterfaceMember>();

    public IList<HmiFaceplateInterfaceMember> TagInterfaceProperties { get; } = new List<HmiFaceplateInterfaceMember>();
}
