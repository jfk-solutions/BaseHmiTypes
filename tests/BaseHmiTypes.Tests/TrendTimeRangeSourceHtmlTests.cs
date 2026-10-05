using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass]
public class TrendTimeRangeSourceHtmlTests
{
    [TestMethod]
    public async Task SourceRangeValuesRemainIndependentOrderedAndFinite()
    {
        var control=new HmiTrendControl();var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);
        control.TimeAxes.Add(new() {Name="Axis <A>",TimeRangeFactor=0d});control.TimeAxes.Add(new() {Name="Axis <A>",TimeRangeBaseMilliseconds=-2.5d});control.TimeAxes.Add(new() {TimeRangeFactor=1e308,TimeRangeBaseMilliseconds=1e308});control.TimeAxes.Add(new() {TimeRangeFactor=double.NaN,TimeRangeBaseMilliseconds=double.PositiveInfinity});control.TimeAxes.Add(new());
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var attrs=Regex.Matches(html,"<hmi-trend-control\\b([^>]*)>").Cast<Match>().Last().Groups[1].Value;using var json=JsonDocument.Parse(WebUtility.HtmlDecode(Regex.Match(attrs,"time-axes=\"([^\"]*)\"").Groups[1].Value));var axes=json.RootElement;Assert.AreEqual(5,axes.GetArrayLength());Assert.AreEqual(0d,axes[0].GetProperty("timeRangeFactor").GetDouble());Assert.IsFalse(axes[0].TryGetProperty("timeRangeBaseMilliseconds",out _));Assert.AreEqual(-2.5d,axes[1].GetProperty("timeRangeBaseMilliseconds").GetDouble());Assert.IsFalse(axes[1].TryGetProperty("timeRangeFactor",out _));Assert.AreEqual(1e308,axes[2].GetProperty("timeRangeFactor").GetDouble());Assert.AreEqual(1e308,axes[2].GetProperty("timeRangeBaseMilliseconds").GetDouble());
        foreach(var axis in axes.EnumerateArray())Assert.IsFalse(axis.TryGetProperty("timeSpan",out _));foreach(var index in new[] {3,4}) {Assert.IsFalse(axes[index].TryGetProperty("timeRangeFactor",out _));Assert.IsFalse(axes[index].TryGetProperty("timeRangeBaseMilliseconds",out _));}Assert.AreEqual("Axis <A>",axes[0].GetProperty("name").GetString());Assert.AreEqual("Axis <A>",axes[1].GetProperty("name").GetString());
    }
}
