using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiNcPartProgramControl : HmiControlWindowBase
{
    public HmiNcPartProgramControl() => HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiNcPartProgramControl;

    public HmiProperty<HmiColor>? ListBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ListForegroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }
    public HmiProperty<HmiColor>? AlternatingRowBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? GridLineColor { get; set; }
    public HmiProperty<bool>? ShowGridLines { get; set; }
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
    public HmiProperty<HmiColor>? TextualObjectsBorderBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? TextualObjectsBorderColor { get; set; }
    public HmiProperty<double>? TextualObjectsBorderWidth { get; set; }
    public HmiProperty<int>? TextualObjectsCornerRadius { get; set; }
    public HmiProperty<int>? TextualObjectsEdgeStyle { get; set; }
}
