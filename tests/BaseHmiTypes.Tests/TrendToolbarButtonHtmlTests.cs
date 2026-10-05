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
public class TrendToolbarButtonHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task TrendVariantsKeepHiddenToolbarEntriesAndAbsentProperties(bool functionTrend)
    {
        HmiTrendControlBase control=functionTrend?new HmiFunctionTrendControl():new HmiTrendControl();
        control.ShowToolbar=false;
        control.ToolbarButtons.Add(new() { SourceType="Command <A> & B", Enabled=false, Order=0, Tooltip=HmiMultilingualText.FromText("") });
        control.ToolbarButtons.Add(new() { SourceType="Unknown command", Visible=false, Order=int.MinValue });
        control.ToolbarButtons.Add(new());
        var screen=new HmiScreen(); var layer=new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(control);
        var renderer=new HmiScreenToHtmlConverter();
        string Attributes(string html)=>Regex.Matches(html,"<hmi-trend-control\\b([^>]*)>").Cast<Match>().Last().Groups[1].Value;
        var attributes=Attributes(await renderer.ConvertAsync(screen));
        StringAssert.Contains(attributes,"show-toolbar=\"false\"");
        using var json=JsonDocument.Parse(WebUtility.HtmlDecode(Regex.Match(attributes,"toolbar-buttons=\"([^\"]*)\"").Groups[1].Value));
        var buttons=json.RootElement; Assert.AreEqual(3,buttons.GetArrayLength());
        Assert.AreEqual("Command <A> & B",buttons[0].GetProperty("sourceType").GetString());
        Assert.AreEqual(false,buttons[0].GetProperty("enabled").GetBoolean()); Assert.AreEqual("",buttons[0].GetProperty("tooltip").GetString());
        Assert.IsFalse(buttons[0].TryGetProperty("visible",out _)); Assert.AreEqual(int.MinValue,buttons[1].GetProperty("order").GetInt32());
        Assert.AreEqual(false,buttons[1].GetProperty("visible").GetBoolean()); Assert.IsFalse(buttons[1].TryGetProperty("tooltip",out _));
        Assert.AreEqual(0,buttons[2].EnumerateObject().Count());
        control.ToolbarButtons.Clear(); Assert.IsFalse(Attributes(await renderer.ConvertAsync(screen)).Contains("toolbar-buttons="));
    }
}
