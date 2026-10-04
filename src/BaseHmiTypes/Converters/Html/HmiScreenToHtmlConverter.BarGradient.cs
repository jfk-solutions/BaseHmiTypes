using System;
using System.Text;
using System.Globalization;
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
        if (HasBarNativeGradient(bar, context))
        {
            style.Append("background-color: transparent;");
            return;
        }
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

    private static bool HasBarNativeGradient(HmiBar bar, HmiHtmlConvertContext context) =>
        IsBarGradient(bar, context) && context.EffectiveProperties.Resolve(bar, nameof(HmiBar.GradientMode), bar.GradientMode) is not null;

    private static void AppendBarNativeGradientAttributes(StringBuilder html, HmiBar bar, HmiHtmlConvertContext context)
    {
        if (!HasBarNativeGradient(bar, context)) return;
        var mode = context.EffectiveProperties.Resolve(bar, nameof(HmiBar.GradientMode), bar.GradientMode)?.StaticValue ?? -1;
        AppendAttribute(html, "data-hmi-bar-gradient-mode", mode.ToString(CultureInfo.InvariantCulture));
        if (mode is < 0 or > 3) return;
        var disabled = !ResolveStaticValue(bar.Enabled, context) && ResolveStaticValue(bar.UseDisabledForegroundColor, context)
            ? context.EffectiveProperties.Resolve(bar, nameof(HmiPaintedScreenItemBase.DisabledForegroundColor), bar.DisabledForegroundColor) : null;
        var start = (disabled ?? GetBarThresholdFillColor(bar, context) ??
            context.EffectiveProperties.Resolve(bar, nameof(HmiBar.FillColor), bar.FillColor) ??
            context.EffectiveProperties.Resolve(bar, nameof(HmiPaintedScreenItemBase.ForegroundColor), bar.ForegroundColor))?.StaticValue ?? HmiColor.FromArgb(255, 0, 0, 0);
        var end = (context.EffectiveProperties.Resolve(bar, nameof(HmiScaleWidgetBase.FillEndColor), bar.FillEndColor) ??
            context.EffectiveProperties.Resolve(bar, nameof(HmiPaintedScreenItemBase.PatternColor), bar.PatternColor))?.StaticValue ?? HmiColor.FromArgb(255, 0, 0, 0);
        var sigma = context.EffectiveProperties.Resolve(bar, nameof(HmiBar.GradientSigmaBlend), bar.GradientSigmaBlend)?.StaticValue ?? false;
        AppendAttribute(html, "data-hmi-bar-gradient-sigma", sigma ? "true" : "false");
        // Static/tag-fallback palettes. Runtime tag evaluation and foreground animation
        // evaluation are separate; native bars have an independent explicit FillColor.
        var ramps = new StringBuilder("[");
        foreach (var count in new[] { 16, 64, 256 })
        {
            if (count != 16) ramps.Append(',');
            ramps.Append('[');
            for (var index = 0; index <= count; index++)
            {
                if (index != 0) ramps.Append(',');
                var factor = sigma ? NativeBarSigmaRampFactors[index * 256 / count] : index / (float)count;
                var alpha = RoundBarGradientByte(start.Alpha * (1 - factor) + end.Alpha * factor);
                var red = MixBarGradientChannel(start.Red, start.Alpha, end.Red, end.Alpha, factor);
                var green = MixBarGradientChannel(start.Green, start.Alpha, end.Green, end.Alpha, factor);
                var blue = MixBarGradientChannel(start.Blue, start.Alpha, end.Blue, end.Alpha, factor);
                ramps.Append(((alpha << 24) | (red << 16) | (green << 8) | blue).ToString(CultureInfo.InvariantCulture));
            }
            ramps.Append(']');
        }
        ramps.Append(']');
        AppendAttribute(html, "data-hmi-bar-gradient-ramps", ramps.ToString());
    }

    private static uint RoundBarGradientByte(float value) => (uint)Math.Floor(value + 0.5f);

    private static uint MixBarGradientChannel(byte start, byte startAlpha, byte end, byte endAlpha, float factor) =>
        RoundBarGradientByte(start * startAlpha / 255f * (1 - factor) + end * endAlpha / 255f * factor);
}
