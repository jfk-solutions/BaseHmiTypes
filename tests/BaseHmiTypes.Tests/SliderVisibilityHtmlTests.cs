using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;

[TestClass]
public class SliderVisibilityHtmlTests
{
    [TestMethod]
    [DataRow(null, false)] [DataRow(null, true)]
    [DataRow(false, false)] [DataRow(false, true)]
    [DataRow(true, false)] [DataRow(true, true)]
    public async Task ConfiguredVisibilityKeepsTrackAndValue(bool? visible, bool palette)
    {
        foreach (var tagged in new[] { false, true })
        {
            var slider = new HmiSlider { Width = 200, Height = 40, BeginValue = 0, EndValue = 100, Value = 25 };
            if (visible.HasValue)
                slider.ShowThumb = tagged ? HmiProperty.Tag("Slider.ThumbVisible", visible.Value) : HmiProperty.Static(visible.Value);
            if (palette) slider.ThumbBackgroundColor = HmiColor.FromArgb(255, 255, 0, 0);
            var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(slider);
            var original = slider.ShowThumb;
            var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
            var input = Regex.Match(html, "<input[^>]*data-hmi-slider[^>]*>").Value;
            Assert.AreEqual(visible.HasValue, input.Contains("data-show-thumb="));
            if (visible.HasValue) StringAssert.Contains(input, $"data-show-thumb=\"{(visible.Value ? "true" : "false")}\"");
            Assert.AreEqual(palette || visible == false, input.Contains("data-hmi-slider-custom-thumb=\"true\""));
            StringAssert.Contains(input, "type=\"range\""); StringAssert.Contains(input, "value=\"25\"");
            StringAssert.Contains(input, "min=\"0\""); StringAssert.Contains(input, "max=\"100\"");
            StringAssert.Contains(input, "disabled=\"disabled\""); StringAssert.Contains(input, "step=\"any\"");
            Assert.AreSame(original, slider.ShowThumb);
            StringAssert.Contains(html, "input[data-hmi-slider][data-show-thumb=\"false\"]::-webkit-slider-thumb{visibility:hidden;}");
            StringAssert.Contains(html, "input[data-hmi-slider][data-show-thumb=\"false\"]::-moz-range-thumb{visibility:hidden;}");
        }
    }
}
