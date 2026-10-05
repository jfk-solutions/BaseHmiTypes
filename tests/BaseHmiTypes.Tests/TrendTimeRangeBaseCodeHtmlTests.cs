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
public class TrendTimeRangeBaseCodeHtmlTests
{
    [TestMethod]
    public async Task MissingZeroAndUnknownBaseCodesRemainIndependentOfDerivedUnits()
    {
        var control=new HmiTrendControl();var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);control.TimeAxes.Add(new());foreach(var code in new[] {0,6,7,37,int.MinValue,int.MaxValue})control.TimeAxes.Add(new() {TimeRangeBaseCode=code,TimeRangeFactor=2.5d});
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var attrs=Regex.Matches(html,"<hmi-trend-control\\b([^>]*)>").Cast<Match>().Last().Groups[1].Value;using var json=JsonDocument.Parse(WebUtility.HtmlDecode(Regex.Match(attrs,"time-axes=\"([^\"]*)\"").Groups[1].Value));var axes=json.RootElement;Assert.AreEqual(7,axes.GetArrayLength());Assert.IsFalse(axes[0].TryGetProperty("timeRangeBaseCode",out _));var index=1;foreach(var code in new[] {0,6,7,37,int.MinValue,int.MaxValue}) {var axis=axes[index++];Assert.AreEqual(code,axis.GetProperty("timeRangeBaseCode").GetInt32());Assert.AreEqual(2.5d,axis.GetProperty("timeRangeFactor").GetDouble());Assert.IsFalse(axis.TryGetProperty("timeRangeBaseMilliseconds",out _));Assert.IsFalse(axis.TryGetProperty("timeSpan",out _));Assert.IsFalse(axis.TryGetProperty("timeSpanUnit",out _));}
    }
}
