using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass]
public class TrendTableStyleHtmlTests
{
    [TestMethod]
    [DataRow(false)]
    [DataRow(true)]
    public async Task OptionalTableAppearanceStaysIndependentOfChartGrid(bool function)
    {
        HmiTrendControlBase control = function ? new HmiFunctionTrendControl() : new HmiTrendControl();
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(control); screen.Layers.Add(layer);
        var converter = new HmiScreenToHtmlConverter();
        async Task<string> Tag() => Regex.Matches(await converter.ConvertAsync(screen), "<hmi-trend-control[^>]*>").Last().Value;
        var empty = await Tag(); Assert.IsFalse(empty.Contains("data-table-"));
        control.ShowTableGridLines = false;
        control.TableGridLineColor = HmiColor.FromArgb(255,68,85,102);
        control.AlternatingRowBackgroundColor = HmiColor.FromArgb(0,17,34,51);
        control.HeaderBorderWidth = 0d;
        control.XAxisGridVisible = true;
        var html = await Tag();
        StringAssert.Contains(html, "data-table-grid-lines-visible=\"false\"");
        StringAssert.Contains(html, "data-table-header-border-width=\"0\"");
        StringAssert.Contains(html, "data-table-grid-line-color=\"#445566\"");
        StringAssert.Contains(html, "data-table-alternating-row-background-color=\"rgba(17,34,51,0)\"");
        StringAssert.Contains(html, "x-axis-grid-visible=\"true\"");
        control.ShowTableGridLines = true;
        StringAssert.Contains(await Tag(), "data-table-grid-lines-visible=\"true\"");
    }
}
