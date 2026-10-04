using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Common;

namespace BaseHmiTypes.Screens.Controls;

public class HmiDetailedParameterControl : HmiControlWindowBase
{
    public HmiDetailedParameterControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiDetailedParameterControl;
    }

    public HmiProperty<bool>? ParameterSetTypeFixed { get; set; }
    public HmiProperty<uint>? CurrentParameterSetId { get; set; }
    public HmiProperty<uint>? CurrentParameterSetTypeId { get; set; }
    public HmiProperty<HmiMultilingualText>? ParameterSetTypeLabel { get; set; }
    public HmiProperty<HmiMultilingualText>? ParameterSetLabel { get; set; }
    public HmiProperty<HmiMultilingualText>? NumberLabel { get; set; }
    public HmiProperty<bool>? HideDetails { get; set; }
    public HmiProperty<HmiColor>? GridLineColor { get; set; }
    public HmiProperty<double>? GridLineWidth { get; set; }
    /// <summary>Native editing-mode value; no cross-family enum translation is assumed.</summary>
    public HmiProperty<int>? EditMode { get; set; }
    public HmiProperty<bool>? ShowToolbar { get; set; }
    public HmiProperty<bool>? ShowStatusBar { get; set; }
    public HmiProperty<HmiColor>? ToolbarBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? StatusBarBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? StatusBarForegroundColor { get; set; }
}
