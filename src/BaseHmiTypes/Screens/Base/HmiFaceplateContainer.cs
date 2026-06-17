namespace BaseHmiTypes.Screens.Base;

public class HmiFaceplateContainer : HmiContainerBase
{
    public HmiFaceplateContainer()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiFaceplateContainer;
    }

    public string? FaceplateId { get; set; }

    public string? FaceplateName { get; set; }

    public string? FaceplateVersion { get; set; }

    public IList<HmiFaceplateInterfaceValue> InterfaceValues { get; } = new List<HmiFaceplateInterfaceValue>();
}
