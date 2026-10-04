using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;

[TestClass]
public class BarNativeGradientHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var mode in Enumerable.Range(0, 16).Concat(new[] { -1, 65535 }))
        foreach (var direction in Enum.GetValues<HmiFillDirection>())
        foreach (var sigma in new[] { false, true })
        foreach (var tagged in new[] { false, true }) yield return [mode, direction, sigma, tagged];
    }

    [TestMethod, DynamicData(nameof(Cases))]
    public async Task PreservesNativeModesPalettesAndColorPriority(int mode, HmiFillDirection direction, bool sigma, bool tagged)
    {
        var priority = (mode + 65536 + (int)direction) % 3;
        var end = HmiColor.FromArgb((byte)(tagged ? 128 : 255), 0, 255, 0);
        var bar = new HmiBar
        {
            Width = 100, Height = 80, BeginValue = 0, EndValue = 100, Value = 25,
            OriginValue = tagged ? HmiProperty.Static(50d) : null, FillDirection = direction,
            FillStyle = HmiBarFillStyle.Gradient,
            GradientMode = tagged ? HmiProperty.Tag("Gradient.Mode", mode) : HmiProperty.Static(mode),
            GradientSigmaBlend = tagged ? HmiProperty.Tag("Gradient.Sigma", sigma) : HmiProperty.Static(sigma),
            FillEndColor = tagged ? HmiProperty.Tag("Gradient.End", end) : HmiProperty.Static(end),
            FillGradientDirection = HmiGradientDirection.DiagonalUp, FillGradientAxis = "vertical", FillGradientStop = 0,
            FillColor = HmiColor.FromArgb(255, 128, 128, 128), PatternColor = HmiColor.FromArgb(255, 0, 0, 255),
            TrackColor = HmiColor.FromArgb(255, 32, 64, 96), Enabled = priority != 2,
            UseDisabledForegroundColor = true, DisabledForegroundColor = HmiColor.FromArgb(255, 255, 0, 0),
            UseThresholdFillColors = priority == 1
        };
        bar.Thresholds.Add(new() { Value = 50, Color = HmiColor.FromArgb(255, 255, 255, 0) });
        var html = await Render(bar);
        var fill = Regex.Match(html, "<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        StringAssert.Contains(fill, $"data-hmi-bar-gradient-mode=\"{mode}\"");
        StringAssert.Contains(fill, "background-color: transparent;");
        Assert.IsFalse(fill.Contains("linear-gradient", StringComparison.Ordinal));
        Assert.AreEqual(mode is >= 0 and <= 3, fill.Contains("data-hmi-bar-gradient-ramps=", StringComparison.Ordinal));
        if (mode is < 0 or > 3) return;
        StringAssert.Contains(fill, $"data-hmi-bar-gradient-sigma=\"{sigma.ToString().ToLowerInvariant()}\"");
        var ramps = JsonSerializer.Deserialize<uint[][]>(Regex.Match(fill, "data-hmi-bar-gradient-ramps=\"([^\"]+)\"").Groups[1].Value)!;
        CollectionAssert.AreEqual(new[] { 17, 65, 257 }, ramps.Select(ramp => ramp.Length).ToArray());
        var start = priority == 2 ? 0xffff0000u : priority == 1 ? 0xffffff00u : 0xff808080u;
        var endPixel = tagged ? 0x80008000u : 0xff00ff00u;
        foreach (var ramp in ramps)
        {
            Assert.AreEqual(start, ramp[0]);
            Assert.AreEqual(sigma ? start : endPixel, ramp[^1]);
            if (sigma) Assert.AreEqual(endPixel, ramp[ramp.Length / 2]);
        }
        StringAssert.Contains(fill, direction is HmiFillDirection.Up or HmiFillDirection.Down ? "height: 25%;" : "width: 25%;");
        StringAssert.Contains(html, "--hmi-bar-track-background: #204060 !important;");
    }

    [TestMethod]
    public async Task MissingEndUsesPatternColorAndMissingPatternUsesBlack()
    {
        var bar = new HmiBar { Width = 100, Height = 40, BeginValue = 0, EndValue = 100, Value = 50,
            FillStyle = HmiBarFillStyle.Gradient, GradientMode = 0, ForegroundColor = HmiColor.FromArgb(255, 128, 128, 128),
            PatternColor = HmiColor.FromArgb(255, 0, 0, 255) };
        var fill = Regex.Match(await Render(bar), "<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        var ramps = JsonSerializer.Deserialize<uint[][]>(Regex.Match(fill, "data-hmi-bar-gradient-ramps=\"([^\"]+)\"").Groups[1].Value)!;
        Assert.AreEqual(0xff808080u, ramps[0][0]); Assert.AreEqual(0xff0000ffu, ramps[0][^1]);
        bar.PatternColor = null;
        fill = Regex.Match(await Render(bar), "<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        ramps = JsonSerializer.Deserialize<uint[][]>(Regex.Match(fill, "data-hmi-bar-gradient-ramps=\"([^\"]+)\"").Groups[1].Value)!;
        Assert.AreEqual(0xff000000u, ramps[0][^1]);
    }

    private static async Task<string> Render(HmiBar bar)
    {
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(bar);
        return await new HmiScreenToHtmlConverter().ConvertAsync(screen);
    }
}
