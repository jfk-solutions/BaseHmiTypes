using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public abstract class HmiTextWidgetBase : HmiWidgetBase
{
    public HmiProperty<HmiMultilingualText>? Text { get; set; }

    public HmiProperty<HmiMultilingualText>? AlternateText { get; set; }

    public HmiProperty<bool>? ReadOnly { get; set; }

    public HmiProperty<string>? OutputFormat { get; set; }

    public HmiProperty<string>? FormatPattern { get; set; }

    public HmiProperty<int>? FieldLength { get; set; }

    public HmiProperty<bool>? FitToLargest { get; set; }

    public HmiProperty<bool>? Resizable { get; set; }

    public HmiProperty<double>? ExtraHeightOffset { get; set; }

    public HmiProperty<HmiColor>? AboveUpperLimitColor { get; set; }

    public HmiProperty<HmiColor>? BelowLowerLimitColor { get; set; }
}
