using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiUserViewControl : HmiLayoutContainerBase
{
    public HmiUserViewControl() => HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiUserViewControl;

    public HmiProperty<HmiColor>? HeaderBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? HeaderForegroundColor { get; set; }
    public HmiProperty<double>? HeaderBorderWidth { get; set; }
    public HmiProperty<HmiColor>? HeaderBorderColor { get; set; }
    public HmiProperty<HmiColor>? ContentBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ContentForegroundColor { get; set; }
    public HmiFont? HeaderFont { get; set; }
    public HmiFont? ContentFont { get; set; }

    public HmiProperty<bool>? ShowGridLines { get; set; }
    public HmiProperty<HmiColor>? GridLineColor { get; set; }
    public HmiProperty<HmiColor>? AlternatingRowBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }

    public HmiProperty<HmiColor>? HeaderBorderBackgroundColor { get; set; }
    public HmiProperty<double>? HeaderCornerRadius { get; set; }
    public HmiProperty<int>? HeaderBackFillStyle { get; set; }
    public HmiProperty<int>? HeaderEdgeStyle { get; set; }
    public HmiProperty<HmiColor>? HeaderFirstGradientColor { get; set; }
    public HmiProperty<HmiColor>? HeaderMiddleGradientColor { get; set; }
    public HmiProperty<HmiColor>? HeaderSecondGradientColor { get; set; }
    public HmiProperty<double>? HeaderFirstGradientOffset { get; set; }
    public HmiProperty<double>? HeaderSecondGradientOffset { get; set; }
    public HmiProperty<bool>? UseHeaderFirstGradient { get; set; }
    public HmiProperty<bool>? UseHeaderSecondGradient { get; set; }
    public HmiProperty<double>? HeaderFontReferenceDeviceSize { get; set; }
    public HmiProperty<double>? ContentFontReferenceDeviceSize { get; set; }
}
