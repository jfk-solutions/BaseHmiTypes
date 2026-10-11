using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;

[TestClass]
public class ClockDialHtmlTests
{
    [TestMethod]
    public async Task UnboundDialTagUsesTheModelDefaultPreview()
    {
        var clock = new HmiClock { Analog = true, DialMode = HmiProperty.Tag<int>("Clock.DialMode") };
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(clock);
        var html = Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(screen), "<time\\b[\\s\\S]*?</time>").Value;
        StringAssert.Contains(html, "data-clock-dial-mode=\"0\"");
        Assert.IsFalse(html.Contains("data-clock-tick=")); Assert.IsFalse(html.Contains("data-clock-label="));
        Assert.AreEqual("Clock.DialMode", ((HmiTagProperty<int>)clock.DialMode).TagName);
    }

    [TestMethod]
    [DataRow(null)] [DataRow(0)] [DataRow(1)] [DataRow(2)]
    [DataRow(-1)] [DataRow(3)] [DataRow(int.MaxValue)]
    public async Task DialDetailsAreIndependentOfHandsAndNumberStyle(int? mode)
    {
        foreach (var tagged in new[] { false, true })
        {
            var clock = new HmiClock { Analog = true, ShowHours = false, ShowMinutes = true, ShowSeconds = true,
                NumberStyle = 99, DialColor = HmiColor.FromArgb(0,17,34,51), TicksColor = HmiColor.FromArgb(255,34,51,68),
                DialLabelColor = HmiColor.FromArgb(255,51,68,85), DialLabelFont = new HmiFont { Name = "Dial & Face", Size = 9, Bold = true } };
            if (mode.HasValue) clock.DialMode = tagged ? HmiProperty.Tag("Clock.DialMode", mode.Value) : HmiProperty.Static(mode.Value);
            var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(clock);
            var original = clock.DialMode;
            var html = Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(screen), "<time\\b[\\s\\S]*?</time>").Value;
            Assert.AreEqual(mode.HasValue, html.Contains("data-clock-dial-mode="));
            if (mode.HasValue) StringAssert.Contains(html, $"data-clock-dial-mode=\"{mode}\"");
            Assert.AreEqual(mode == 1 ? 12 : 0, Regex.Matches(html,"data-clock-label=\"").Count);
            Assert.AreEqual(mode is 0 or 1 ? 0 : 60, Regex.Matches(html,"data-clock-tick=\"").Count);
            StringAssert.Contains(Regex.Match(html,"<circle[^>]*data-clock-dial[^>]*>").Value,"fill=\"rgba(17,34,51,0)\"");
            StringAssert.Contains(html,"font-family: Dial &amp; Face;font-size: 9px;font-weight: bold;");
            if (mode == 1) StringAssert.Contains(Regex.Match(html,"<g[^>]*data-clock-labels[^>]*>").Value,"fill=\"#334455\"");
            Assert.IsFalse(html.Contains("data-clock-hand=\"hour\""));
            StringAssert.Contains(html,"data-clock-hand=\"minute\""); StringAssert.Contains(html,"data-clock-hand=\"second\"");
            Assert.AreSame(original, clock.DialMode); Assert.AreEqual(99, clock.NumberStyle!.StaticValue);
        }
    }

    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)]
    public async Task DialColorRespectsExplicitTransparentBackground(int background)
    {
        var clock = new HmiClock { Analog = true, BackgroundStyle = background, DialColor = HmiColor.FromArgb(255,17,34,51) };
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(clock);
        var html = Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(screen), "<time\\b[\\s\\S]*?</time>").Value;
        Assert.AreEqual(background != 2, html.Contains("data-clock-dial=\"true\""));
        if (background != 2) StringAssert.Contains(Regex.Match(html,"<circle[^>]*data-clock-dial[^>]*>").Value,"fill=\"#112233\"");
    }
}
