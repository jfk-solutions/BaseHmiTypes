using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;

[TestClass]
public class BarGradientHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var gradient in Enum.GetValues<HmiGradientDirection>())
        foreach (var fill in Enum.GetValues<HmiFillDirection>())
        foreach (var tagged in new[] { false, true })
        for (var priority = 0; priority < 3; priority++)
            yield return [gradient, fill, tagged, priority];
    }

    [TestMethod, DynamicData(nameof(Cases))]
    public async Task RendersGradientInValueRectangleWithFillPriorities(HmiGradientDirection gradient, HmiFillDirection direction, bool tagged, int priority)
    {
        var bar = CreateBar();
        bar.FillGradientDirection = gradient;
        bar.FillDirection = direction;
        bar.OriginValue = tagged ? HmiProperty.Static(50d) : null;
        bar.FillEndColor = tagged ? HmiProperty.Tag("Gradient.End", HmiColor.FromArgb(255, 0, 255, 0)) : HmiProperty.Static(HmiColor.FromArgb(255, 0, 255, 0));
        bar.FillGradientStop = tagged ? HmiProperty.Tag("Gradient.Stop", 80d) : HmiProperty.Static(80d);
        bar.Enabled = priority != 2;
        bar.UseDisabledForegroundColor = true;
        bar.DisabledForegroundColor = HmiColor.FromArgb(255, 255, 0, 0);
        bar.UseThresholdFillColors = priority == 1;
        bar.Thresholds.Add(new() { Value = 50, Color = HmiColor.FromArgb(255, 255, 255, 0) });
        var html = await Render(bar);
        var fill = Regex.Match(html, "<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        var axis = gradient switch
        {
            HmiGradientDirection.HorizontalFromRight => "to left",
            HmiGradientDirection.VerticalFromBottom => "to top",
            HmiGradientDirection.VerticalFromTop or HmiGradientDirection.VerticalFromCenter => "to bottom",
            HmiGradientDirection.DiagonalUp => "to top right",
            HmiGradientDirection.DiagonalDown => "to bottom right",
            _ => "to right"
        };
        var stops = gradient is HmiGradientDirection.HorizontalFromCenter or HmiGradientDirection.VerticalFromCenter
            ? "#00FF00 10%, currentColor 50%, #00FF00 90%" : "currentColor 0%, #00FF00 80%";
        StringAssert.Contains(fill, $"background-image: linear-gradient({axis}, {stops});");
        StringAssert.Contains(fill, $"color: {(priority == 2 ? "#FF0000" : priority == 1 ? "#FFFF00" : "#808080")} !important;");
        StringAssert.Contains(fill, direction is HmiFillDirection.Up or HmiFillDirection.Down ? "height: 25%;" : "width: 25%;");
        StringAssert.Contains(fill, $"data-origin-value=\"{(tagged ? "50" : "0")}\"");
        StringAssert.Contains(html, "value=\"25\"");
        StringAssert.Contains(html, "--hmi-bar-track-background: #204060 !important;");
    }

    [TestMethod]
    [DataRow(-1d, "0")]
    [DataRow(200d, "100")]
    [DataRow(double.NaN, "100")]
    [DataRow(double.PositiveInfinity, "100")]
    public async Task ClampsOrDefaultsStop(double stop, string expected)
    {
        var bar = CreateBar(); bar.FillGradientStop = stop; bar.FillGradientAxis = "VERTICAL";
        StringAssert.Contains(await Render(bar), $"linear-gradient(to bottom, currentColor 0%, #00FF00 {expected}%);");
    }

    [TestMethod]
    public async Task DefaultsAndMissingEndColorAreSafe()
    {
        var bar = CreateBar(); bar.FillGradientAxis = "unexpected); invalid";
        StringAssert.Contains(await Render(bar), "linear-gradient(to right, currentColor 0%, #00FF00 100%);");
        bar.FillEndColor = null;
        Assert.IsFalse((await Render(bar)).Contains("background-image: linear-gradient", StringComparison.Ordinal));
        bar.FillEndColor = HmiColor.FromArgb(255, 0, 255, 0); bar.FillStyle = HmiBarFillStyle.Solid;
        Assert.IsFalse((await Render(bar)).Contains("background-image: linear-gradient", StringComparison.Ordinal));
    }

    private static HmiBar CreateBar() => new()
    {
        Width = 100, Height = 40, BeginValue = 0, EndValue = 100, Value = 25, FillDirection = HmiFillDirection.Right,
        FillStyle = HmiBarFillStyle.Gradient, FillColor = HmiColor.FromArgb(255, 128, 128, 128),
        FillEndColor = HmiColor.FromArgb(255, 0, 255, 0), TrackColor = HmiColor.FromArgb(255, 32, 64, 96)
    };

    private static async Task<string> Render(HmiBar bar)
    {
        var layer = new HmiLayer(); layer.Items.Add(bar);
        var screen = new HmiScreen(); screen.Layers.Add(layer);
        return await new HmiScreenToHtmlConverter().ConvertAsync(screen);
    }
}
