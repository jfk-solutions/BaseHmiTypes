using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class TrendLegacyAxisTextHtmlTests
{
    public static IEnumerable<object?[]> Cases()
    {
        foreach (var mode in new[] { "legacy", "localized", "empty", "localized-only", "absent", "empty-neutral" })
            foreach (var lcid in new int?[] { null, 1031, 1036 }) yield return [mode, lcid];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task PenAndLegacyAxesResolveSelectedCultureWithoutChangingModels(string mode, int? lcid)
    {
        HmiMultilingualText? text = null;
        if (mode is not "legacy" and not "absent")
        {
            text = new();
            if (mode != "localized-only") text.Texts[-1] = mode == "empty-neutral" ? "" : "Neutral <label>";
            text.Texts[1031] = mode == "empty" ? "" : "Deutsch <label>";
        }
        var legacy = mode == "absent" ? null : "Legacy <label>";
        var control = new HmiTrendControl { XAxisLabel = legacy, YAxisLabel = legacy, XAxisLabelText = text, YAxisLabelText = text };
        var pen = new HmiTrendPen { Number = 1, ValueAxisLabel = legacy, ValueAxisLabelText = text }; control.Pens.Add(pen);
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(control);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, options: new() { CultureLcid = lcid });
        var attributes = Regex.Matches(html, "<hmi-trend-control\\b([^>]*)>").Cast<Match>().Last().Groups[1].Value;
        var expected = mode == "absent" ? null : mode == "legacy" ? legacy : lcid == 1031 ? mode == "empty" ? "" : "Deutsch <label>" : mode == "localized-only" ? "Deutsch <label>" : mode == "empty-neutral" ? "" : "Neutral <label>";
        foreach (var key in new[] { "x-axis-label", "y-axis-label" })
        {
            var match = Regex.Match(attributes, key + "=\"([^\"]*)\""); Assert.AreEqual(!string.IsNullOrEmpty(expected), match.Success);
            if (!string.IsNullOrEmpty(expected)) Assert.AreEqual(expected, WebUtility.HtmlDecode(match.Groups[1].Value));
        }
        using var json = JsonDocument.Parse(WebUtility.HtmlDecode(Regex.Match(attributes, "pens=\"([^\"]*)\"").Groups[1].Value));
        Assert.AreEqual(expected != null, json.RootElement[0].TryGetProperty("valueAxisLabel", out var label)); if (expected != null) Assert.AreEqual(expected, label.GetString());
        Assert.AreEqual(legacy, control.XAxisLabel); Assert.AreEqual(legacy, pen.ValueAxisLabel); Assert.AreSame(text, control.YAxisLabelText);
        if (text != null) Assert.AreEqual(mode == "empty" ? "" : "Deutsch <label>", text.Texts[1031]);
    }
}
