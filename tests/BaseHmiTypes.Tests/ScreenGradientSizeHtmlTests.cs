using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class ScreenGradientSizeHtmlTests
{
    [TestMethod]
    [DataRow(HmiFillPatternAlignment.Normal)]
    [DataRow(HmiFillPatternAlignment.StretchToViewport)]
    public async Task GradientOverridesHatchTileSizing(HmiFillPatternAlignment alignment)
    {
        var screen = new HmiScreen
        {
            Width = 800, Height = 480,
            BackgroundColor = HmiColor.FromArgb(255, 150, 174, 194),
            AlternateBackgroundColor = HmiColor.FromArgb(255, 255, 255, 255),
            FillPattern = HmiFillPattern.GradientVertical,
            FillPatternAlignment = alignment
        };
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var style = Regex.Match(html, "<div[^>]*data-hmi-screen=\"true\"[^>]*>").Value;
        StringAssert.Contains(style, "linear-gradient(to bottom, #96AEC2 0%, #FFFFFF 100%)");
        var sizes = Regex.Matches(style, "background-size: ([^;]+);");
        Assert.AreEqual("100% 100%", sizes[^1].Groups[1].Value);
        StringAssert.Contains(style, "background-repeat: no-repeat;");
    }
}
