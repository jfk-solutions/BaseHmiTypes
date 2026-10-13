using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class DateTimeFieldPlaceholderHtmlTests
{
    [TestMethod]
    [DataRow(true, false, "--.--.----")]
    [DataRow(false, true, "--:--:--")]
    [DataRow(true, true, "--.--.---- --:--:--")]
    [DataRow(false, false, "")]
    public async Task MissingValuesUseAlignedPlaceholders(bool date, bool time, string expected)
    {
        var field = new HmiDateTimeField { Name = "DateTime", ShowDate = date, ShowTime = time,
            HorizontalAlignment = HmiHorizontalAlignment.Right, VerticalAlignment = HmiVerticalAlignment.Bottom };
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(field);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html, ">" + expected + "</div>");
        StringAssert.Contains(html, "justify-content: flex-end;align-items: flex-end;");
        Assert.AreEqual(date || time, html.Contains("aria-label=\"Date/time value not loaded\""));
        StringAssert.Contains(html, "data-date-time-value-state=\"missing\"");
    }
}
