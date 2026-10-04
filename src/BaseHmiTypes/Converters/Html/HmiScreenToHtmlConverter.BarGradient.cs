using System;
using System.Text;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;

namespace BaseHmiTypes.Converters.Html;

public partial class HmiScreenToHtmlConverter
{
    private static bool IsBarGradient(HmiBar bar, HmiHtmlConvertContext context) =>
        context.EffectiveProperties.TryGetStaticValue(bar, nameof(HmiBar.FillStyle), bar.FillStyle, out var fillStyle) &&
        fillStyle == HmiBarFillStyle.Gradient;

    private static void AppendBarGradientStyle(StringBuilder style, HmiBar bar, HmiHtmlConvertContext context)
    {
        if (!IsBarGradient(bar, context) ||
            context.EffectiveProperties.Resolve(bar, nameof(HmiScaleWidgetBase.FillEndColor), bar.FillEndColor)?.StaticValue is not HmiColor endColor)
            return;
        var direction = bar.FillGradientDirection ??
            (string.Equals(bar.FillGradientAxis, "vertical", StringComparison.OrdinalIgnoreCase)
                ? HmiGradientDirection.VerticalFromTop : HmiGradientDirection.HorizontalFromLeft);
        var stop = context.EffectiveProperties.Resolve(bar, nameof(HmiScaleWidgetBase.FillGradientStop), bar.FillGradientStop)?.StaticValue ?? 100;
        stop = IsFinite(stop) ? Clamp(stop, 0, 100) : 100;
        // Use currentColor so disabled, threshold and explicit fill priorities remain intact.
        // This is the generic bar gradient, not WinCC's quantized category-16 GDI+ brush.
        style.Append("background-color: transparent; background-image: linear-gradient(").Append(ToCss(direction)).Append(", ");
        if (direction is HmiGradientDirection.HorizontalFromCenter or HmiGradientDirection.VerticalFromCenter)
            style.Append(ToCss(endColor)).Append(' ').Append(ToCss(50 - stop / 2)).Append("%, currentColor 50%, ")
                .Append(ToCss(endColor)).Append(' ').Append(ToCss(50 + stop / 2)).Append("%");
        else
            style.Append("currentColor 0%, ").Append(ToCss(endColor)).Append(' ').Append(ToCss(stop)).Append('%');
        style.Append(");");
    }
}
