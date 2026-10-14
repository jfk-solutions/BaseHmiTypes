using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;

[TestClass]
public class TouchAreaHtmlTests
{
    [TestMethod]
    public async Task TouchAreasRemainTransparentNamedInputRegions()
    {
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer);
        layer.Items.Add(new HmiTouchArea { Name = "Touch", X = 10, Y = 20, Width = 120, Height = 60 });
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var area = Regex.Match(html, "<div[^>]*id=\"Touch\"[^>]*></div>").Value;
        Assert.IsNotEmpty(area); StringAssert.Contains(area, "left: 10px"); StringAssert.Contains(area, "width: 120px");
        Assert.IsFalse(html.Contains(">HmiTouchArea<"));
    }
}
