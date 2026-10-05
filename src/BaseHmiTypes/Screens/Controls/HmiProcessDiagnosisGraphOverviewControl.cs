using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiProcessDiagnosisGraphOverviewControl : HmiControlWindowBase
{
    public string? AssociatedGraphDbTagSourceId { get; set; }
    public string? AssociatedGraphDbTagName { get; set; }

    public HmiProperty<HmiColor>? ErrorColor { get; set; }
    public HmiProperty<HmiColor>? HighlightColor { get; set; }
    public HmiProperty<HmiColor>? SelectedStepColor { get; set; }
    public HmiProperty<HmiColor>? SeparatorColor { get; set; }
    public HmiProperty<HmiColor>? ToolbarBackgroundColor { get; set; }
    public HmiProperty<bool>? UseToolbarBackgroundColor { get; set; }
    public HmiProperty<bool>? ShowMessageViewButton { get; set; }
    public HmiProperty<bool>? ShowPlcCodeViewButton { get; set; }
    public HmiProperty<bool>? ShowStepButton { get; set; }
    public HmiProperty<HmiColor>? ButtonBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ButtonBorderBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ButtonBorderColor { get; set; }
    public HmiProperty<HmiColor>? ButtonFirstGradientColor { get; set; }
    public HmiProperty<HmiColor>? ButtonMiddleGradientColor { get; set; }
    public HmiProperty<HmiColor>? ButtonSecondGradientColor { get; set; }
    public HmiProperty<double>? ButtonBorderWidth { get; set; }
    public HmiProperty<int>? ButtonCornerRadius { get; set; }
    public HmiProperty<int>? ButtonEdgeStyle { get; set; }
    public HmiProperty<int>? ButtonBackFillStyle { get; set; }
    public HmiProperty<double>? ButtonFirstGradientOffset { get; set; }
    public HmiProperty<double>? ButtonSecondGradientOffset { get; set; }
    public HmiProperty<bool>? UseButtonFirstGradient { get; set; }
    public HmiProperty<bool>? UseButtonSecondGradient { get; set; }

    public HmiProcessDiagnosisGraphOverviewControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiProcessDiagnosisGraphOverviewControl;
    }

}
