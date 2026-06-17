namespace BaseHmiTypes.Screens.Base;

public class HmiDcsFaceplateContainer : HmiPaintedScreenItemBase
{
    public HmiDcsFaceplateContainer()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiDcsFaceplateContainer;
    }

    public string FaceplateName { get; set; }

    public string FaceplateVersion { get; set; }

}
