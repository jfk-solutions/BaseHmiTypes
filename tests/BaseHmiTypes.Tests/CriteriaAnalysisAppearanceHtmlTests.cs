using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class CriteriaAnalysisAppearanceHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task HeaderGradientsRemainConfiguredWhenHeadingsAreHidden(bool visible)
    {
        var item = new HmiProcessDiagnosisCriteriaAnalysisControl
        {
            Name = "Criteria <A> & B", ShowColumnHeadings = visible,
            HeaderBackgroundColor = HmiColor.FromArgb(0, 17, 34, 51),
            HeaderBorderBackgroundColor = HmiColor.FromArgb(255, 21, 22, 23),
            HeaderCornerRadius = 0, HeaderBackFillStyle = -7, HeaderEdgeStyle = int.MinValue,
            HeaderFirstGradientColor = HmiColor.FromArgb(255, 31, 32, 33),
            HeaderMiddleGradientColor = HmiColor.FromArgb(255, 41, 42, 43),
            HeaderSecondGradientColor = HmiColor.FromArgb(255, 51, 52, 53),
            HeaderFirstGradientOffset = -10, HeaderSecondGradientOffset = 120,
            UseHeaderFirstGradient = true, UseHeaderSecondGradient = true
        };
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(item);
        var renderer = new HmiScreenToHtmlConverter();
        string Header(string html) => Regex.Match(html, "<div data-appearance-sample=\"header\"(.*?)</div>").Value;
        var html = await renderer.ConvertAsync(screen);
        StringAssert.Contains(html, "Criteria &lt;A&gt; &amp; B");
        foreach (var key in new[] { "header-border-background-color", "header-corner-radius", "header-back-fill-style", "header-edge-style", "header-first-gradient-color", "header-middle-gradient-color", "header-second-gradient-color", "header-first-gradient-offset", "header-second-gradient-offset", "use-header-first-gradient", "use-header-second-gradient" }) StringAssert.Contains(html, "data-" + key + "=");
        StringAssert.Contains(html, "data-header-edge-style=\"-2147483648\"");
        Assert.AreEqual(visible, Header(html).Contains("linear-gradient("));
        Assert.AreEqual(visible, Header(html).Contains("border-radius: 0px;"));
        Assert.AreEqual(-10d, item.HeaderFirstGradientOffset!.StaticValue); Assert.AreEqual(120d, item.HeaderSecondGradientOffset!.StaticValue);
        item.ShowColumnHeadings = true; item.UseHeaderFirstGradient = false; item.UseHeaderSecondGradient = false;
        var disabled = Header(await renderer.ConvertAsync(screen));
        Assert.IsFalse(disabled.Contains("linear-gradient(")); StringAssert.Contains(disabled, "background-color: rgba(17,34,51,0);");
        foreach (var radius in new[] { -1d, double.NaN, double.PositiveInfinity })
        {
            item.HeaderCornerRadius = radius;
            Assert.IsFalse(Header(await renderer.ConvertAsync(screen)).Contains("border-radius:"));
        }
        item.HeaderBackgroundColor = null; item.HeaderFirstGradientColor = null; item.HeaderMiddleGradientColor = null; item.HeaderSecondGradientColor = null;
        var codes = await renderer.ConvertAsync(screen);
        StringAssert.Contains(codes, "data-header-back-fill-style=\"-7\"");
        StringAssert.Contains(codes, "data-header-border-background-color=");
        Assert.IsFalse(Header(codes).Contains("background-color:"));
    }

    [TestMethod]
    public async Task ConfiguredAppearanceReachesIndependentSamples()
    {
        var item = new HmiProcessDiagnosisCriteriaAnalysisControl
        {
            Name = "CriteriaPreview", ShowGridLines = true, ShowColumnHeadings = true,
            GridLineColor = HmiColor.FromArgb(0, 17, 34, 51),
            AlternatingRowBackgroundColor = HmiColor.FromArgb(255, 21, 22, 23),
            ContentBackgroundColor = HmiColor.FromArgb(255, 31, 32, 33),
            ContentForegroundColor = HmiColor.FromArgb(255, 41, 42, 43),
            HeaderBackgroundColor = HmiColor.FromArgb(255, 51, 52, 53),
            HeaderForegroundColor = HmiColor.FromArgb(255, 61, 62, 63),
            HeaderBorderColor = HmiColor.FromArgb(255, 71, 72, 73), HeaderBorderWidth = 0,
        };
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(item);
        var renderer = new HmiScreenToHtmlConverter();
        string Sample(string html, string kind) => Regex.Match(html, $"<div data-appearance-sample=\"{kind}\"[^>]*>").Value;
        var html = await renderer.ConvertAsync(screen);
        StringAssert.Contains(html, "data-show-grid-lines=\"true\"");
        StringAssert.Contains(html, "Criteria analysis appearance preview; diagnostic data not loaded");
        var header = Sample(html, "header");
        foreach (var text in new[] { "background-color: #333435;", "color: #3D3E3F;", "border-color: #474849;", "border-width: 0px;" }) StringAssert.Contains(header, text);
        var content = Sample(html, "content"); var alternate = Sample(html, "alternate");
        StringAssert.Contains(content, "background-color: #1F2021;");
        StringAssert.Contains(alternate, "background-color: #151617;");
        foreach (var sample in new[] { content, alternate })
        {
            StringAssert.Contains(sample, "color: #292A2B;");
            StringAssert.Contains(sample, "border-bottom: 1px solid currentColor;");
            StringAssert.Contains(sample, "border-bottom-color: rgba(17,34,51,0);");
        }
        item.ShowColumnHeadings = false; item.ShowGridLines = false;
        html = await renderer.ConvertAsync(screen);
        Assert.AreEqual("", Sample(html, "header"));
        Assert.IsFalse(Sample(html, "content").Contains("border-bottom"));
        StringAssert.Contains(html, "data-show-column-headings=\"false\"");
        StringAssert.Contains(html, "data-grid-line-color=");
        item.ShowColumnHeadings = null; item.ShowGridLines = null; item.AlternatingRowBackgroundColor = null;
        item.HeaderBorderWidth = -1;
        html = await renderer.ConvertAsync(screen);
        Assert.IsFalse(html.Contains("data-show-grid-lines="));
        Assert.IsFalse(Sample(html, "header").Contains("border-width"));
        StringAssert.Contains(Sample(html, "alternate"), "background-color: #1F2021;");
        foreach (var width in new[] { double.NaN, double.PositiveInfinity })
        {
            item.HeaderBorderWidth = width;
            Assert.IsFalse(Sample(await renderer.ConvertAsync(screen), "header").Contains("border-width"));
        }
    }
}
