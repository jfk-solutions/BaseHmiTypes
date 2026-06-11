namespace BaseHmiTypes.Screens.Base;

public class HmiOcxControl : HmiCustomWidgetContainer
{
    public HmiOcxControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiOcxControl;
    }

    public string? OcxGuid { get; set; }

    public string? OcxName { get; set; }

    public byte[]? OcxState { get; set; }

    public string? OcxStateFormat { get; set; }

    public HmiAxHostState? AxHostState { get; set; }
}
