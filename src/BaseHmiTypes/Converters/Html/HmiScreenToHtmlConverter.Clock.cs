using System.Text;
using BaseHmiTypes.Screens.Widgets;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Converters.Html;

public partial class HmiScreenToHtmlConverter
{
    // Fixed sample matches the existing digital renderer; this is not a live clock.
    private static void AppendAnalogClockPreview(StringBuilder html, HmiClock clock, HmiHtmlConvertContext context)
    {
        var foreground = clock.ForegroundColor is null ? "#000000" : ToCss(ResolveStaticValue(clock.ForegroundColor, context));
        var ticks = clock.TicksColor is null ? foreground : ToCss(ResolveStaticValue(clock.TicksColor, context));
        var fill = clock.HandFillColor is null ? foreground : ToCss(ResolveStaticValue(clock.HandFillColor, context));
        if (clock.OutlinedHands is not null && ResolveStaticValue(clock.OutlinedHands, context)) fill = "none";
        html.Append("<time");
        AppendCommonAttributes(html, clock, context, additionalStyle: "display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden;");
        AppendAttribute(html, "datetime", "2000-01-01T12:34:56");
        AppendAttribute(html, "data-format", ResolveStaticValue(clock.Format, context));
        AppendAttribute(html, "data-time-zone", ResolveStaticValue(clock.TimeZone, context));
        AppendBooleanAttribute(html, "data-analog", true);
        AppendAttribute(html, "data-clock-preview", "static");
        html.Append("><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid meet\" role=\"img\" aria-label=\"Analog clock preview: 12:34:56\" style=\"width: 100%; height: 100%; min-height: 0; flex: 1;\">");
        html.Append("<circle data-clock-dial=\"true\" cx=\"50\" cy=\"50\" r=\"48\" fill=\"none\"");
        AppendAttribute(html, "stroke", foreground); html.Append(" stroke-width=\"1\"/>");
        if (clock.ShowTicks is null || ResolveStaticValue(clock.ShowTicks, context))
        {
            var tickRadius = ClockPercent(clock.SecondHandLengthPercent, 80, context) * 48 / 100;
            for (var i = 0; i < 60; i++)
            {
                html.Append("<circle data-clock-tick=\"").Append(i).Append('"');
                AppendSvgAttribute(html, "cx", 50); AppendSvgAttribute(html, "cy", 50 - tickRadius);
                AppendSvgAttribute(html, "r", i % 5 == 0 ? 2 : .75);
                AppendAttribute(html, "transform", $"rotate({i * 6} 50 50)");
                AppendAttribute(html, "fill", ticks); html.Append("/>");
            }
        }
        if (clock.ShowTime is null || ResolveStaticValue(clock.ShowTime, context))
        {
            if (clock.ShowHours is null || ResolveStaticValue(clock.ShowHours, context))
                AppendClockHand(html,"hour",17,ClockPercent(clock.HourHandLengthPercent,50,context),ClockPercent(clock.HourHandHalfWidthPercent,10,context),foreground,fill);
            if (clock.ShowMinutes is null || ResolveStaticValue(clock.ShowMinutes, context))
                AppendClockHand(html,"minute",204,ClockPercent(clock.MinuteHandLengthPercent,70,context),ClockPercent(clock.MinuteHandHalfWidthPercent,8,context),foreground,fill);
            if (clock.ShowSeconds is not null && ResolveStaticValue(clock.ShowSeconds, context))
                AppendClockHand(html,"second",336,ClockPercent(clock.SecondHandLengthPercent,80,context),ClockPercent(clock.SecondHandHalfWidthPercent,2,context),foreground,fill);
            html.Append("<circle data-clock-hub=\"true\" cx=\"50\" cy=\"50\" r=\"2\"");
            AppendAttribute(html,"fill",foreground); html.Append("/>");
        }
        html.Append("</svg>");
        if (clock.ShowDate is not null && ResolveStaticValue(clock.ShowDate, context)) html.Append("<span data-clock-date=\"true\">2000-01-01</span>");
        html.Append("</time>");
    }

    private static double ClockPercent(HmiProperty<double>? property, double fallback, HmiHtmlConvertContext context)
    {
        var value = property is null ? fallback : ResolveStaticValue(property, context);
        return double.IsNaN(value) || double.IsInfinity(value) ? fallback : Math.Max(0, Math.Min(100, value));
    }

    private static void AppendClockHand(StringBuilder html, string name, int angle, double lengthPercent, double widthPercent, string stroke, string fill)
    {
        if (lengthPercent <= 0 || widthPercent <= 0) return;
        var length = 48 * lengthPercent / 100;
        var width = length * widthPercent / 100;
        html.Append("<polygon"); AppendAttribute(html,"data-clock-hand",name);
        AppendAttribute(html,"points",$"50,{ToCss(50-.01*length)} {ToCss(50-width)},{ToCss(50-.15*length)} 50,{ToCss(50-length)} {ToCss(50+width)},{ToCss(50-.15*length)} 50,{ToCss(50-.01*length)}");
        AppendAttribute(html,"transform",$"rotate({angle} 50 50)");
        AppendAttribute(html,"stroke",stroke); AppendAttribute(html,"fill",fill);
        html.Append(" stroke-width=\"1\"/>");
    }
}
