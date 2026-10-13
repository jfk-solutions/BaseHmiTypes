using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using System.Text.RegularExpressions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass]
public class GraphicEmptyFillHtmlTests
{
    [TestMethod]
    public async Task EmptyFillDoesNotPaintGraphicBackground()
    {
        var screen=new HmiScreen(); var layer=new HmiLayer();screen.Layers.Add(layer);
        var graphic=new HmiGraphicView { Name="Logo", BackFillPattern=65536, BackgroundColor=HmiColor.FromArgb(255,255,255,255) };layer.Items.Add(graphic);
        Assert.IsFalse(Regex.IsMatch(await new HmiScreenToHtmlConverter().ConvertAsync(screen),"id=\"Logo\"[^>]*background-color"));
        graphic.BackFillPattern=1048577;
        Assert.IsTrue(Regex.IsMatch(await new HmiScreenToHtmlConverter().ConvertAsync(screen),"id=\"Logo\"[^>]*background-color"));
    }
}
