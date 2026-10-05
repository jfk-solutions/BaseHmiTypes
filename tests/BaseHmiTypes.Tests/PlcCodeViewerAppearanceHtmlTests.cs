using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class PlcCodeViewerAppearanceHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task DistinctAreasAndHiddenConfigurationArePreserved(bool configured)
    {
        var control = new HmiProcessDiagnosisPlcCodeViewerControl { Name = "Code <A> & B" };
        if (configured)
        {
            control.HeaderBackgroundColor = HmiColor.FromArgb(0,1,2,3);
            control.HeaderForegroundColor = HmiColor.FromArgb(255,2,2,3);
            control.HeaderBorderColor = HmiColor.FromArgb(255,3,2,3);
            control.HeaderBorderWidth = 0;
            control.ContentBackgroundColor = HmiColor.FromArgb(255,5,2,3);
            control.ContentForegroundColor = HmiColor.FromArgb(255,6,2,3);
            control.DrawingAreaBackgroundColor = HmiColor.FromArgb(255,7,2,3);
            control.DrawingAreaForegroundColor = HmiColor.FromArgb(255,8,2,3);
            control.PathHeaderBackgroundColor = HmiColor.FromArgb(255,9,2,3);
            control.PathHeaderForegroundColor = HmiColor.FromArgb(255,10,2,3);
            control.ShowGridLines = true;
            control.AlternatingRowBackgroundColor = HmiColor.FromArgb(255,12,2,3);
            control.GridLineColor = HmiColor.FromArgb(255,13,2,3);
            control.ToolbarBackgroundColor = HmiColor.FromArgb(255,14,2,3);
            control.ShowToolbar = true;
            control.UseToolbarBackgroundColor = true;
            control.ToolbarAlignment = -7;
            control.ButtonBackgroundColor = HmiColor.FromArgb(255,18,2,3);
            control.ButtonBorderBackgroundColor = HmiColor.FromArgb(255,19,2,3);
            control.ButtonBorderColor = HmiColor.FromArgb(255,20,2,3);
            control.ButtonFirstGradientColor = HmiColor.FromArgb(255,21,2,3);
            control.ButtonMiddleGradientColor = HmiColor.FromArgb(255,22,2,3);
            control.ButtonSecondGradientColor = HmiColor.FromArgb(255,23,2,3);
            control.ButtonBorderWidth = 2.5;
            control.ButtonCornerRadius = 0;
            control.ButtonEdgeStyle = -7;
            control.ButtonBackFillStyle = -7;
            control.ButtonFirstGradientOffset = -10;
            control.ButtonSecondGradientOffset = 120;
            control.UseButtonFirstGradient = true;
            control.UseButtonSecondGradient = true;
            control.HeaderBorderBackgroundColor = HmiColor.FromArgb(255,32,2,3);
            control.HeaderCornerRadius = 0;
            control.HeaderBackFillStyle = -7;
            control.HeaderEdgeStyle = -7;
            control.HeaderFirstGradientColor = HmiColor.FromArgb(255,36,2,3);
            control.HeaderMiddleGradientColor = HmiColor.FromArgb(255,37,2,3);
            control.HeaderSecondGradientColor = HmiColor.FromArgb(255,38,2,3);
            control.HeaderFirstGradientOffset = -10;
            control.HeaderSecondGradientOffset = 120;
            control.UseHeaderFirstGradient = true;
            control.UseHeaderSecondGradient = true;
            control.HeaderFont = new HmiFont { Name = "Header Preview", Size = 11 };
            control.ContentFont = new HmiFont { Name = "Content Preview", Size = 13 };
        }
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(control);
        var renderer = new HmiScreenToHtmlConverter(); var html = await renderer.ConvertAsync(screen);
        string Sample(string source, string kind) => Regex.Match(source, $"<div data-appearance-sample=\"{kind}\"(.*?)</div>").Value;
        StringAssert.Contains(html, "Code &lt;A&gt; &amp; B"); StringAssert.Contains(html, "aria-label=\"PLC code viewer\"");
        StringAssert.Contains(html, "PLC code viewer data not loaded"); Assert.IsFalse(html.Contains("<button"));
        foreach (var key in new[] {"data-header-background-color=","data-header-foreground-color=","data-header-border-color=","data-header-border-width=","data-content-background-color=","data-content-foreground-color=","data-drawing-area-background-color=","data-drawing-area-foreground-color=","data-path-header-background-color=","data-path-header-foreground-color=","data-show-grid-lines=","data-alternating-row-background-color=","data-grid-line-color=","data-toolbar-background-color=","data-show-toolbar=","data-use-toolbar-background-color=","data-toolbar-alignment=","data-button-background-color=","data-button-border-background-color=","data-button-border-color=","data-button-first-gradient-color=","data-button-middle-gradient-color=","data-button-second-gradient-color=","data-button-border-width=","data-button-corner-radius=","data-button-edge-style=","data-button-back-fill-style=","data-button-first-gradient-offset=","data-button-second-gradient-offset=","data-use-button-first-gradient=","data-use-button-second-gradient=","data-header-border-background-color=","data-header-corner-radius=","data-header-back-fill-style=","data-header-edge-style=","data-header-first-gradient-color=","data-header-middle-gradient-color=","data-header-second-gradient-color=","data-header-first-gradient-offset=","data-header-second-gradient-offset=","data-use-header-first-gradient=","data-use-header-second-gradient="}) Assert.AreEqual(configured, html.Contains(key), key);
        foreach (var kind in new[] {"path-header", "drawing", "table-header", "content", "alternate", "toolbar", "button"}) Assert.AreEqual(1, Regex.Matches(html, $"data-appearance-sample=\"{kind}\"").Count);
        Assert.AreEqual(configured, Sample(html, "table-header").Contains("linear-gradient("));
        Assert.AreEqual(configured, Sample(html, "button").Contains("linear-gradient("));
        if (configured)
        {
            StringAssert.Contains(Sample(html, "path-header"), "background-color: #090203;");
            StringAssert.Contains(Sample(html, "path-header"), "color: #0A0203;");
            StringAssert.Contains(Sample(html, "drawing"), "background-color: #070203;");
            StringAssert.Contains(Sample(html, "drawing"), "color: #080203;");
            StringAssert.Contains(Sample(html, "table-header"), "background-color: rgba(1,2,3,0);");
            StringAssert.Contains(Sample(html, "table-header"), "color: #020203;");
            StringAssert.Contains(Sample(html, "table-header"), "border-color: #030203;");
            StringAssert.Contains(Sample(html, "table-header"), "border-width: 0px;");
            StringAssert.Contains(Sample(html, "table-header"), "border-radius: 0px;");
            StringAssert.Contains(Sample(html, "table-header"), "font-family: Header Preview;");
            StringAssert.Contains(Sample(html, "content"), "background-color: #050203;");
            StringAssert.Contains(Sample(html, "content"), "color: #060203;");
            StringAssert.Contains(Sample(html, "content"), "border-bottom-color: #0D0203;");
            StringAssert.Contains(Sample(html, "content"), "font-family: Content Preview;");
            StringAssert.Contains(Sample(html, "alternate"), "background-color: #0C0203;");
            StringAssert.Contains(Sample(html, "alternate"), "color: #060203;");
            StringAssert.Contains(Sample(html, "toolbar"), "background-color: #0E0203;");
            StringAssert.Contains(Sample(html, "button"), "border-width: 2.5px;");
            StringAssert.Contains(Sample(html, "button"), "border-radius: 0px;");
            StringAssert.Contains(html, "data-toolbar-alignment=\"-7\"");
            Assert.AreEqual(-10d, control.HeaderFirstGradientOffset!.StaticValue); Assert.AreEqual(120d, control.HeaderSecondGradientOffset!.StaticValue);
            control.ShowToolbar = false; control.ShowGridLines = false;
            control.UseHeaderFirstGradient = false; control.UseHeaderSecondGradient = false;
            control.UseButtonFirstGradient = false; control.UseButtonSecondGradient = false;
            var hidden = await renderer.ConvertAsync(screen);
            Assert.AreEqual("", Sample(hidden, "toolbar")); Assert.IsFalse(Sample(hidden, "content").Contains("border-bottom:"));
            Assert.IsFalse(Sample(hidden, "table-header").Contains("linear-gradient(")); Assert.IsFalse(Sample(hidden, "button").Contains("linear-gradient("));
            StringAssert.Contains(hidden, "data-toolbar-background-color=\"#0E0203\""); StringAssert.Contains(hidden, "data-show-toolbar=\"false\"");
            control.ShowToolbar = null; control.UseToolbarBackgroundColor = false; control.AlternatingRowBackgroundColor = null;
            var fallback = await renderer.ConvertAsync(screen);
            Assert.IsFalse(Sample(fallback, "toolbar").Contains("background-color:")); StringAssert.Contains(Sample(fallback, "alternate"), "background-color: #050203;");
            control.ButtonCornerRadius = -1;
            foreach (var width in new[] { -1d, double.NaN, double.PositiveInfinity })
            {
                control.HeaderCornerRadius = width; control.HeaderBorderWidth = width; control.ButtonBorderWidth = width;
                var invalid = await renderer.ConvertAsync(screen);
                foreach (var kind in new[] { "table-header", "button" })
                {
                    Assert.IsFalse(Sample(invalid, kind).Contains("border-width:")); Assert.IsFalse(Sample(invalid, kind).Contains("border-radius:"));
                }
            }
            control.HeaderBackgroundColor = null; control.HeaderBorderColor = null; control.HeaderBorderWidth = null;
            control.HeaderFirstGradientColor = null; control.HeaderMiddleGradientColor = null; control.HeaderSecondGradientColor = null;
            var codes = await renderer.ConvertAsync(screen);
            StringAssert.Contains(codes, "data-header-border-background-color="); StringAssert.Contains(codes, "data-header-back-fill-style=\"-7\"");
            Assert.IsFalse(Sample(codes, "table-header").Contains("background-color:")); Assert.IsFalse(Sample(codes, "table-header").Contains("border-style:"));
        }
    }
}
