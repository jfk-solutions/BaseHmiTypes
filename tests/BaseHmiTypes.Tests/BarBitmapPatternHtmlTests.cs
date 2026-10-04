using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;
[TestClass]
public class BarBitmapPatternHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var direction in Enum.GetValues<HmiFillDirection>())
        foreach (var origin in new[] { false, true })
        foreach (var rows in new[] { "55AA55AA55AA55AA", "", "zz00000000000000", "0000" })
        for (var priority = 0; priority < 3; priority++) yield return [direction, origin, rows, priority];
    }
    [TestMethod, DynamicData(nameof(Cases))]
    public async Task RendersOnlyValidRowsAndRetainsColorPriority(HmiFillDirection direction, bool origin, string rows, int priority)
    {
        var bar = new HmiBar { BeginValue = 0, EndValue = 100, Value = 25, Width = 100, Height = 80,
            FillDirection = direction, OriginValue = origin ? HmiProperty.Static(50d) : null,
            FillStyle = HmiBarFillStyle.BitmapPattern, BitmapPatternRows = rows,
            PatternColor = HmiColor.FromArgb(255, 0, 255, 0), FillColor = HmiColor.FromArgb(255, 128, 128, 128),
            Enabled = priority != 2, UseDisabledForegroundColor = true, DisabledForegroundColor = HmiColor.FromArgb(255, 255, 0, 0),
            UseThresholdFillColors = priority != 0 };
        bar.Thresholds.Add(new() { Value = 50, Color = HmiColor.FromArgb(255, 255, 255, 0) });
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(bar);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var fill = Regex.Match(html, "<span[^>]*data-hmi-bar-origin-fill[^>]*>").Value;
        Assert.AreEqual(rows.Length == 16 && rows.All(Uri.IsHexDigit), fill.Contains("data-hmi-bar-bitmap=", StringComparison.Ordinal));
        if (rows.StartsWith("55"))
        {
            StringAssert.Contains(fill, "data-hmi-bar-bitmap=\"55aa55aa55aa55aa\"");
            StringAssert.Contains(fill, "data-hmi-bar-pattern-color=\"#00FF00\"");
            StringAssert.Contains(fill, $"color: {(priority == 2 ? "#FF0000" : priority == 1 ? "#FFFF00" : "#808080")} !important;");
        }
        StringAssert.Contains(html, "data-hmi-screen=\"true\"");
    }
}
