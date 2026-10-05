using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class GraphOverviewAppearanceHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task AppearancePreviewKeepsPaletteAndNativeFlags(bool configured)
    {
        var control = new HmiProcessDiagnosisGraphOverviewControl { Name = "Graph <A> & B", Resizable = configured };
        if (configured)
        {
            control.HeaderBackgroundColor = HmiColor.FromArgb(0,1,2,3);
            control.HeaderForegroundColor = HmiColor.FromArgb(255,2,2,3);
            control.ContentBackgroundColor = HmiColor.FromArgb(255,3,2,3);
            control.ContentForegroundColor = HmiColor.FromArgb(255,4,2,3);
            control.ErrorColor = HmiColor.FromArgb(255,5,2,3);
            control.HighlightColor = HmiColor.FromArgb(255,6,2,3);
            control.SelectedStepColor = HmiColor.FromArgb(255,7,2,3);
            control.SeparatorColor = HmiColor.FromArgb(255,8,2,3);
            control.ToolbarBackgroundColor = HmiColor.FromArgb(255,9,2,3);
            control.UseToolbarBackgroundColor = true;
            control.ShowMessageViewButton = false;
            control.ShowPlcCodeViewButton = true;
            control.ShowStepButton = false;
            control.ButtonBackgroundColor = HmiColor.FromArgb(255,14,2,3);
            control.ButtonBorderBackgroundColor = HmiColor.FromArgb(255,15,2,3);
            control.ButtonBorderColor = HmiColor.FromArgb(255,16,2,3);
            control.ButtonFirstGradientColor = HmiColor.FromArgb(255,17,2,3);
            control.ButtonMiddleGradientColor = HmiColor.FromArgb(255,18,2,3);
            control.ButtonSecondGradientColor = HmiColor.FromArgb(255,19,2,3);
            control.ButtonBorderWidth = 2.5;
            control.ButtonCornerRadius = 0;
            control.ButtonEdgeStyle = -7;
            control.ButtonBackFillStyle = -7;
            control.ButtonFirstGradientOffset = -10;
            control.ButtonSecondGradientOffset = 120;
            control.UseButtonFirstGradient = true;
            control.UseButtonSecondGradient = true;
            control.HeaderFont = new HmiFont { Name = "Preview Header", Size = 11 };
            control.ContentFont = new HmiFont { Name = "Preview Content", Size = 13 };
            control.AssociatedGraphDbTagSourceId = "17:9223372036854775807";
            control.AssociatedGraphDbTagName = "GraphDbTag <A> & B";
        }
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(control); screen.Layers.Add(layer);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html, "Graph &lt;A&gt; &amp; B");
        StringAssert.Contains(html, "Graph diagnostics not loaded");
        StringAssert.Contains(html, "data-preview=\"appearance\"");
        foreach (var key in new[] {"data-header-background-color=","data-header-foreground-color=","data-content-background-color=","data-content-foreground-color=","data-error-color=","data-highlight-color=","data-selected-step-color=","data-separator-color=","data-toolbar-background-color=","data-use-toolbar-background-color=","data-show-message-view-button=","data-show-plc-code-view-button=","data-show-step-button=","data-button-background-color=","data-button-border-background-color=","data-button-border-color=","data-button-first-gradient-color=","data-button-middle-gradient-color=","data-button-second-gradient-color=","data-button-border-width=","data-button-corner-radius=","data-button-edge-style=","data-button-back-fill-style=","data-button-first-gradient-offset=","data-button-second-gradient-offset=","data-use-button-first-gradient=","data-use-button-second-gradient="}) Assert.AreEqual(configured, html.Contains(key), key);
        foreach (var kind in new[] {"path-header", "step", "error", "highlight", "selected-step", "separator", "toolbar", "button"}) Assert.AreEqual(1, Regex.Matches(html, $"data-appearance-sample=\"{kind}\"").Count);
        StringAssert.Contains(html, "aria-label=\"Graph overview\"");
        Assert.AreEqual(configured, html.Contains("data-associated-graph-db-tag-source-id="));
        Assert.AreEqual(configured, html.Contains("data-associated-graph-db-tag-name="));

        string Sample(string source, string kind) => Regex.Match(source, $"<div data-appearance-sample=\"{kind}\"(.*?)</div>").Value;
        var button = Sample(html, "button");
        Assert.AreEqual(configured, button.Contains("linear-gradient("));
        Assert.IsFalse(html.Contains("<button"));
        if(configured)
        {
            StringAssert.Contains(button, "border-radius: 0px;"); StringAssert.Contains(button, "border-width: 2.5px;");
            StringAssert.Contains(Sample(html, "path-header"), "background-color: rgba(1,2,3,0);");
            StringAssert.Contains(Sample(html, "path-header"), "color: #020203;");
            StringAssert.Contains(Sample(html, "path-header"), "font-family: Preview Header;");
            StringAssert.Contains(Sample(html, "step"), "background-color: #030203;");
            StringAssert.Contains(Sample(html, "step"), "color: #040203;");
            StringAssert.Contains(Sample(html, "step"), "font-family: Preview Content;");
            StringAssert.Contains(Sample(html, "error"), "background-color: #050203;");
            StringAssert.Contains(Sample(html, "highlight"), "background-color: #060203;");
            StringAssert.Contains(Sample(html, "selected-step"), "background-color: #070203;");
            StringAssert.Contains(Sample(html, "separator"), "background-color: #080203;");
            StringAssert.Contains(Sample(html, "toolbar"), "background-color: #090203;");
            StringAssert.Contains(html, "data-associated-graph-db-tag-source-id=\"17:9223372036854775807\"");
            StringAssert.Contains(html, "data-associated-graph-db-tag-name=\"GraphDbTag &lt;A&gt; &amp; B\"");
            StringAssert.Contains(html, "data-show-plc-code-view-button=\"true\"");
            StringAssert.Contains(html, "data-show-step-button=\"false\"");
            StringAssert.Contains(html, "data-show-message-view-button=\"false\"");
            StringAssert.Contains(html, "data-button-edge-style=\"-7\"");
            Assert.AreEqual(-10d, control.ButtonFirstGradientOffset!.StaticValue);
            Assert.AreEqual(120d, control.ButtonSecondGradientOffset!.StaticValue);
            control.UseButtonFirstGradient = false; control.UseButtonSecondGradient = false;
            control.UseToolbarBackgroundColor = false; control.ShowMessageViewButton = true;
            var disabled = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
            Assert.IsFalse(Sample(disabled, "button").Contains("linear-gradient("));
            Assert.IsFalse(Sample(disabled, "toolbar").Contains("background-color:"));
            StringAssert.Contains(disabled, "data-toolbar-background-color=\"#090203\"");
            StringAssert.Contains(disabled, "data-show-message-view-button=\"true\"");
            control.UseToolbarBackgroundColor = null;
            StringAssert.Contains(Sample(await new HmiScreenToHtmlConverter().ConvertAsync(screen), "toolbar"), "background-color: #090203;");
            control.ButtonCornerRadius = -3;
            foreach (var width in new[] { -1d, double.NaN, double.PositiveInfinity })
            {
                control.ButtonBorderWidth = width;
                var invalid = Sample(await new HmiScreenToHtmlConverter().ConvertAsync(screen), "button");
                Assert.IsFalse(invalid.Contains("border-width:")); Assert.IsFalse(invalid.Contains("border-radius:"));
            }
            control.ButtonBackgroundColor = null; control.ButtonBorderColor = null;
            control.ButtonFirstGradientColor = null; control.ButtonMiddleGradientColor = null; control.ButtonSecondGradientColor = null;
            control.ButtonBorderWidth = null; control.ButtonCornerRadius = null;
            var codesOnly = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
            StringAssert.Contains(codesOnly, "data-button-border-background-color=");
            StringAssert.Contains(codesOnly, "data-button-back-fill-style=\"-7\"");
            var codeSample = Sample(codesOnly, "button");
            Assert.IsFalse(codeSample.Contains("background-color:")); Assert.IsFalse(codeSample.Contains("linear-gradient("));
            Assert.IsFalse(codeSample.Contains("border-style:"));
        }
    }
}
