using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MediaControlHtmlTests
{
    [TestMethod]
    public async Task MediaConfigurationIsEscapedAndRemainsAnUnloadedPreview()
    {
        var control = new HmiMediaControl { Source = "https://example.test/video?a=1&b=<clip>\"", AutoPlay = false };
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(control);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html, "Media not loaded");
        StringAssert.Contains(html, "Source: https://example.test/video?a=1&amp;b=&lt;clip&gt;&quot;");
        StringAssert.Contains(html, "data-auto-play=\"false\"");
        StringAssert.Contains(html, "Autoplay: false");
        Assert.IsFalse(html.Contains("<video")); Assert.IsFalse(html.Contains("<audio")); Assert.IsFalse(html.Contains("<iframe"));
        control.AutoPlay = true;
        html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html, "data-auto-play=\"true\"");
        control.Source = new HmiExpressionProperty<string> { Expression = "{Media <source>}" };
        control.AutoPlay = new HmiExpressionProperty<bool> { Expression = "{Auto <play>}" };
        html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html, "Source: {Media &lt;source&gt;}");
        StringAssert.Contains(html, "data-media-source=\"{Media &lt;source&gt;}\"");
        StringAssert.Contains(html, "Autoplay: {Auto &lt;play&gt;}");
        control.Source = null; control.AutoPlay = null;
        html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        Assert.IsFalse(html.Contains("data-auto-play=")); Assert.IsFalse(html.Contains("Autoplay:")); Assert.IsFalse(html.Contains("Source:"));
    }
    [TestMethod]
    public async Task MediaBarsSelectLocalizedFontsAndHonorVisibility()
    {
        var toolbarFont = new HmiFont { Name = "NeutralToolbar", Size = 9 };
        toolbarFont.LocalizedFonts[1031] = new HmiFont { Name = "SelectedToolbar", Size = 14, Bold = true };
        var statusFont = new HmiFont { Name = "NeutralStatus", Size = 10 };
        statusFont.LocalizedFonts[1031] = new HmiFont { Name = "SelectedStatus", Size = 12, Italic = true };
        var control = new HmiMediaControl { ShowToolbar = true, ShowStatusBar = true, ToolbarFont = toolbarFont, StatusBarFont = statusFont };
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(control);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, options: new() { CultureLcid = 1031 });
        StringAssert.Contains(html,"font-family: SelectedToolbar;font-size: 14px;"); StringAssert.Contains(html,"font-family: SelectedStatus;font-size: 12px;");
        Assert.IsFalse(html.Contains("NeutralToolbar")); Assert.IsFalse(html.Contains("NeutralStatus"));
        control.ShowToolbar=false; control.ShowStatusBar=false;
        html=await new HmiScreenToHtmlConverter().ConvertAsync(screen, options: new() { CultureLcid = 1031 });
        Assert.IsFalse(html.Contains("role=\"toolbar\"")); Assert.IsFalse(html.Contains("role=\"status\"")); Assert.IsFalse(html.Contains("SelectedToolbar"));
        Assert.AreEqual("NeutralToolbar",toolbarFont.Name!.StaticValue);
    }
}
