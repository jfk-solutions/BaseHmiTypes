using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiDetailedParameterControl : HmiControlWindowBase
{
    public HmiDetailedParameterControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiDetailedParameterControl;
    }

    public HmiProperty<bool>? ParameterSetTypeFixed { get; set; }
    public HmiProperty<bool>? HideDetails { get; set; }
    /// <summary>Native editing-mode value; no cross-family enum translation is assumed.</summary>
    public HmiProperty<int>? EditMode { get; set; }
    public HmiProperty<bool>? ShowToolbar { get; set; }
    public HmiProperty<bool>? ShowStatusBar { get; set; }
    public HmiProperty<HmiColor>? ToolbarBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? StatusBarBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? StatusBarForegroundColor { get; set; }
}
