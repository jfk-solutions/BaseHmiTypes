using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiSystemDiagnosisAppearance
{
    public HmiProperty<HmiColor>? InformationAreaBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? InformationAreaForegroundColor { get; set; }
    public HmiProperty<HmiColor>? ErrorBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ErrorForegroundColor { get; set; }
    public HmiProperty<HmiColor>? InformationAreaFocusColor { get; set; }
    public HmiProperty<double>? InformationAreaFocusWidth { get; set; }
    public HmiProperty<double>? InformationAreaFontReferenceDeviceSize { get; set; }
    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }
    public HmiProperty<bool>? ShowGridLines { get; set; }
    public HmiProperty<HmiColor>? HeaderBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? HeaderForegroundColor { get; set; }
    public HmiProperty<double>? NavigationFontReferenceDeviceSize { get; set; }
    public HmiProperty<HmiColor>? NavigationForegroundColor { get; set; }
    public HmiProperty<bool>? ShowNavigationButtons { get; set; }
    public HmiProperty<bool>? UseToolbarBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? AlternatingRowBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? GridLineColor { get; set; }
    public HmiProperty<int>? ToolbarAlignment { get; set; }
    public HmiProperty<HmiColor>? ToolbarBackgroundColor { get; set; }
    public HmiProperty<double>? HeaderFontReferenceDeviceSize { get; set; }
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
    public HmiProperty<HmiColor>? HeaderBorderColor { get; set; }
    public HmiProperty<double>? HeaderBorderWidth { get; set; }
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
}
