using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;
[TestClass]
public class SliderThumbHtmlTests
{
    [TestMethod]
    [DataRow(false,false,false)] [DataRow(false,false,true)]
    [DataRow(false,true,false)] [DataRow(false,true,true)]
    [DataRow(true,false,false)] [DataRow(true,false,true)]
    [DataRow(true,true,false)] [DataRow(true,true,true)]
    public async Task RendersConfiguredThumbColorsWithoutEnablingWrites(bool background, bool foreground, bool tagged)
    {
        var slider = new HmiSlider { Width = 200, Height = 40, BeginValue = 0, EndValue = 100, Value = 25 };
        if (background) slider.ThumbBackgroundColor = tagged ? HmiProperty.Tag("Thumb.Back", HmiColor.FromArgb(255,255,0,0)) : HmiProperty.Static(HmiColor.FromArgb(255,255,0,0));
        if (foreground) slider.ThumbForegroundColor = tagged ? HmiProperty.Tag("Thumb.Fore", HmiColor.FromArgb(128,0,255,0)) : HmiProperty.Static(HmiColor.FromArgb(128,0,255,0));
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(slider);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var input = Regex.Match(html,"<input[^>]*data-hmi-slider[^>]*>").Value;
        Assert.AreEqual(background || foreground, input.Contains("data-hmi-slider-custom-thumb=\"true\"", StringComparison.Ordinal));
        Assert.AreEqual(background, input.Contains("--hmi-slider-thumb-background: #FF0000;", StringComparison.Ordinal));
        Assert.AreEqual(foreground, input.Contains("--hmi-slider-thumb-foreground: rgba(0,255,0,0.502);", StringComparison.Ordinal));
        StringAssert.Contains(input,"disabled=\"disabled\""); StringAssert.Contains(input,"value=\"25\"");
        StringAssert.Contains(input,"step=\"any\"");
    }
}
