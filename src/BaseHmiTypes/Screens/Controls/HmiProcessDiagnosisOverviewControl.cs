using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiProcessDiagnosisOverviewControl : HmiControlWindowBase
{
    public HmiProperty<HmiColor>? OutputGridLineColor { get; set; }
    public HmiProperty<HmiColor>? OutputLabelForegroundColor { get; set; }
    public HmiProperty<HmiColor>? ErrorIconBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? InfoIconBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ToolbarBackgroundColor { get; set; }
    public HmiProperty<bool>? UseToolbarBackgroundColor { get; set; }
    public HmiProperty<bool>? ShowMessageViewButton { get; set; }
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

    public HmiProcessDiagnosisOverviewControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiProcessDiagnosisOverviewControl;
    }

}
