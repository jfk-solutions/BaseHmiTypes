namespace BaseHmiTypes.Screens.Base;

public class HmiCustomWidgetContainer : HmiLayoutContainerBase
{
    public HmiCustomWidgetContainer()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiCustomWidgetContainer;
    }

    public HmiProperty<bool>? Resizable { get; set; }
    public HmiProperty<bool>? Movable { get; set; }
    public HmiProperty<bool>? ShowWindowBorder { get; set; }
    public HmiProperty<bool>? ShowCaption { get; set; }
    public HmiProperty<bool>? ShowMaximizeButton { get; set; }
    public HmiProperty<bool>? ShowCloseButton { get; set; }
    public HmiProperty<bool>? AlwaysOnTop { get; set; }
    public HmiProperty<string>? HostedApplication { get; set; }
    public HmiProperty<string>? HostedTemplate { get; set; }
}
