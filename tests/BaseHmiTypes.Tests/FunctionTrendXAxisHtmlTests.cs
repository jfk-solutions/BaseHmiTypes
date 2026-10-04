using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class FunctionTrendXAxisHtmlTests
{
    [TestMethod]
    public async Task ConfiguredNumericXAxisMetadataIsExportedAsTypedJson()
    {
        var screen = new HmiScreen { Width = 640, Height = 480 };
        var layer = new HmiLayer();
        screen.Layers.Add(layer);
        var control = new HmiFunctionTrendControl();
        layer.Items.Add(control);
        control.XValueAxes.Add(new HmiTrendXValueAxis
        {
            Name = "Input \"<>&", TrendWindowName = "Area", Label = "Input label",
            MinimumValue = 1, MaximumValue = 100, Visible = false, AutoRange = true,
            DivisionCount = 4, DecimalPlaces = 2, ScaleType = HmiTrendAxisScaleType.Logarithmic,
            ExponentialFormat = true, Color = new HmiColor(255, 18, 52, 86), Alignment = HmiVerticalAlignment.Top
        });
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var attribute = Regex.Match(html, "\\sx-value-axes=\"([^\"]+)\"").Groups[1].Value;
        using var json = JsonDocument.Parse(WebUtility.HtmlDecode(attribute));
        var axis = json.RootElement[0];
        Assert.AreEqual("Input \"<>&", axis.GetProperty("name").GetString());
        Assert.AreEqual("Area", axis.GetProperty("trendWindowName").GetString());
        Assert.AreEqual("Input label", axis.GetProperty("label").GetString());
        Assert.AreEqual(1, axis.GetProperty("minimum").GetDouble());
        Assert.AreEqual(100, axis.GetProperty("maximum").GetDouble());
        Assert.IsFalse(axis.GetProperty("visible").GetBoolean());
        Assert.IsTrue(axis.GetProperty("autoRange").GetBoolean());
        Assert.AreEqual(4, axis.GetProperty("divisionCount").GetInt32());
        Assert.AreEqual(2, axis.GetProperty("decimalPlaces").GetInt32());
        Assert.AreEqual(1, axis.GetProperty("scaleType").GetInt32());
        Assert.IsTrue(axis.GetProperty("exponentialFormat").GetBoolean());
        Assert.AreEqual("#123456", axis.GetProperty("color").GetString());
        Assert.AreEqual("Top", axis.GetProperty("alignment").GetString());
    }
}
