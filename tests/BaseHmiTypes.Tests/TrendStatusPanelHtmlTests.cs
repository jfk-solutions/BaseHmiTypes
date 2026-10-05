using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using BaseHmiTypes.Converters.Html;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class TrendStatusPanelHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task TrendVariantsRetainIndependentStatusPanelMetadata(bool functionTrend)
    {
        HmiTrendControlBase control = functionTrend ? new HmiFunctionTrendControl() : new HmiTrendControl();
        control.ShowStatusBar = false; control.ShowStatusBarTooltips = false;
        control.StatusBarPanels.Add(new() { SourceType = "Configured panel", Text = HmiMultilingualText.FromText(""), Width = double.PositiveInfinity });
        control.StatusBarPanels.Add(new() { SourceType = "Hidden panel", Visible = false, Width = -5, Order = -1, AutoSize = true });
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(control); screen.Layers.Add(layer);
        var renderer = new HmiScreenToHtmlConverter(); var html = await renderer.ConvertAsync(screen);
        var attributes = Regex.Matches(html, "<hmi-trend-control\\b([^>]*)>").Cast<Match>().Last().Groups[1].Value;
        StringAssert.Contains(attributes, "show-status-bar=\"false\""); StringAssert.Contains(attributes, "show-status-bar-tooltips=\"false\"");
        using var json = JsonDocument.Parse(WebUtility.HtmlDecode(Regex.Match(attributes, "status-bar-panels=\"([^\"]*)\"").Groups[1].Value));
        var panels = json.RootElement; Assert.AreEqual(2, panels.GetArrayLength());
        Assert.AreEqual("", panels[0].GetProperty("text").GetString()); Assert.IsFalse(panels[0].TryGetProperty("width", out _));
        Assert.IsFalse(panels[1].TryGetProperty("text", out _)); Assert.AreEqual(-5d, panels[1].GetProperty("width").GetDouble());
        Assert.AreEqual(-1, panels[1].GetProperty("order").GetInt32()); Assert.AreEqual(true, panels[1].GetProperty("autoSize").GetBoolean());
        control.StatusBarPanels.Clear(); control.ShowStatusBarTooltips = null;
        var empty = Regex.Matches(await renderer.ConvertAsync(screen), "<hmi-trend-control\\b([^>]*)>").Cast<Match>().Last().Groups[1].Value;
        Assert.IsFalse(empty.Contains("status-bar-panels=")); Assert.IsFalse(empty.Contains("show-status-bar-tooltips="));
    }
}
