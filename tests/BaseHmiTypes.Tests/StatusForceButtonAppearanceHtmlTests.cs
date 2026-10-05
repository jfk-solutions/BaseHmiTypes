using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class StatusForceButtonAppearanceHtmlTests
{
    [TestMethod]
    public async Task ButtonAppearanceIsOptionalAndRetainsSourceValues()
    {
        var control = new HmiStatusForceControl { Name = "Status <A> & B", HeaderBackgroundColor = HmiColor.FromArgb(255, 1, 2, 3) };
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(control);
        var renderer = new HmiScreenToHtmlConverter();
        string Sample(string html) => Regex.Match(html, "<div data-appearance-sample=\"button\"[^>]*>.*?</div>").Value;
        Assert.AreEqual("", Sample(await renderer.ConvertAsync(screen)));
        control.ButtonBackgroundColor = HmiColor.FromArgb(0, 17, 34, 51);
        control.ButtonBorderBackgroundColor = HmiColor.FromArgb(255, 21, 22, 23);
        control.ButtonBorderColor = HmiColor.FromArgb(255, 31, 32, 33);
        control.ButtonBorderWidth = 0; control.ButtonCornerRadius = 0;
        control.ButtonEdgeStyle = int.MinValue; control.ButtonBackFillStyle = -7;
        control.ButtonFirstGradientColor = HmiColor.FromArgb(255, 41, 42, 43);
        control.ButtonMiddleGradientColor = HmiColor.FromArgb(255, 51, 52, 53);
        control.ButtonSecondGradientColor = HmiColor.FromArgb(255, 61, 62, 63);
        control.ButtonFirstGradientOffset = -10; control.ButtonSecondGradientOffset = 120;
        control.UseButtonFirstGradient = true; control.UseButtonSecondGradient = true;
        var html = await renderer.ConvertAsync(screen); var sample = Sample(html);
        StringAssert.Contains(html, "Status &lt;A&gt; &amp; B");
        StringAssert.Contains(html, "Status/force data not loaded");
        StringAssert.Contains(html, "background-color: #010203;");
        foreach (var key in new[] { "button-background-color", "button-border-background-color", "button-border-color", "button-border-width", "button-corner-radius", "button-edge-style", "button-back-fill-style", "button-first-gradient-color", "button-middle-gradient-color", "button-second-gradient-color", "button-first-gradient-offset", "button-second-gradient-offset", "use-button-first-gradient", "use-button-second-gradient" }) StringAssert.Contains(sample, "data-" + key + "=");
        foreach (var value in new[] { "data-preview=\"appearance\"", "data-button-edge-style=\"-2147483648\"", "border-color: #1F2021;", "border-width: 0px;", "border-radius: 0px;", "linear-gradient(", "Status/force button appearance preview" }) StringAssert.Contains(sample, value);
        Assert.IsFalse(sample.Contains("<button")); Assert.IsFalse(sample.Contains("onclick="));
        Assert.AreEqual(-10d, control.ButtonFirstGradientOffset!.StaticValue); Assert.AreEqual(120d, control.ButtonSecondGradientOffset!.StaticValue);
        control.UseButtonFirstGradient = false; control.UseButtonSecondGradient = false;
        sample = Sample(await renderer.ConvertAsync(screen));
        Assert.IsFalse(sample.Contains("linear-gradient(")); StringAssert.Contains(sample, "background-color: rgba(17,34,51,0);");
        foreach (var width in new[] { -1d, double.NaN, double.PositiveInfinity })
        {
            control.ButtonBorderWidth = width; control.ButtonCornerRadius = -1;
            sample = Sample(await renderer.ConvertAsync(screen));
            Assert.IsFalse(sample.Contains("border-width:")); Assert.IsFalse(sample.Contains("border-radius:"));
        }
        control.ButtonBackgroundColor = null; control.ButtonFirstGradientColor = null; control.ButtonMiddleGradientColor = null; control.ButtonSecondGradientColor = null;
        sample = Sample(await renderer.ConvertAsync(screen));
        StringAssert.Contains(sample, "data-button-back-fill-style=\"-7\"");
        StringAssert.Contains(sample, "data-button-border-background-color=");
        Assert.IsFalse(sample.Contains("background-color:"));
        var flagsOnly = new HmiStatusForceControl { UseButtonFirstGradient = false }; layer.Items.Clear(); layer.Items.Add(flagsOnly);
        StringAssert.Contains(Sample(await renderer.ConvertAsync(screen)), "data-use-button-first-gradient=\"false\"");
    }
}
