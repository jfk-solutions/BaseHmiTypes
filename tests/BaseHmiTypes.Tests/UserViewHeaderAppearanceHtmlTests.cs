using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class UserViewHeaderAppearanceHtmlTests
{
    [TestMethod]
    public async Task HeaderGradientsAndRawFontSizesArePreserved()
    {
        var item = new HmiUserViewControl
        {
            Name = "Table <A> & B", HeaderFontReferenceDeviceSize = 123, ContentFontReferenceDeviceSize = 124,
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
        string Header(string html) => Regex.Match(html, "<th style=\"(.*?)</th>").Value;
        layer.Items.Clear(); layer.Items.Add(new HmiUserViewControl());
        Assert.IsFalse((await renderer.ConvertAsync(screen)).Contains("data-header-corner-radius="));
        layer.Items.Clear(); layer.Items.Add(item);
        var html = await renderer.ConvertAsync(screen);
        StringAssert.Contains(html, "Table &lt;A&gt; &amp; B");
        StringAssert.Contains(html, "data-header-font-reference-device-size=\"123\"");
        StringAssert.Contains(html, "data-content-font-reference-device-size=\"124\"");
        Assert.IsFalse(html.Contains("font-size: 123px")); Assert.IsFalse(html.Contains("font-size: 124px"));
        foreach (var key in new[] { "header-border-background-color", "header-corner-radius", "header-back-fill-style", "header-edge-style", "header-first-gradient-color", "header-middle-gradient-color", "header-second-gradient-color", "header-first-gradient-offset", "header-second-gradient-offset", "use-header-first-gradient", "use-header-second-gradient" }) StringAssert.Contains(html, "data-" + key + "=");
        StringAssert.Contains(html, "data-header-edge-style=\"-2147483648\"");
        Assert.AreEqual(true, Header(html).Contains("linear-gradient("));
        Assert.AreEqual(true, Header(html).Contains("border-radius: 0px;"));
        Assert.AreEqual(-10d, item.HeaderFirstGradientOffset!.StaticValue); Assert.AreEqual(120d, item.HeaderSecondGradientOffset!.StaticValue);
        item.UseHeaderFirstGradient = false; item.UseHeaderSecondGradient = false;
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
}
