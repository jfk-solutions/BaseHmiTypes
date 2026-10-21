using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
namespace BaseHmiTypes.Tests;
[TestClass] public class ShapeEmptyFillHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task NativeEmptyFillKeepsBordersAndExplicitPatternPrecedence(bool circle)
    {
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer);
        HmiShapeBase shape = circle ? new HmiCircle() : new HmiRectangle();
        shape.Name = "Outline"; shape.Width = 100; shape.Height = 100; shape.BackFillPattern = 65536;
        shape.BackgroundColor = HmiColor.FromArgb(255, 0, 0, 40); shape.BorderColor = HmiColor.FromArgb(255, 10, 20, 30); shape.BorderWidth = 10; layer.Items.Add(shape);
        async Task<string> Render() { var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen); return html.Substring(html.LastIndexOf("id=\"Outline\"")); }
        var output = await Render();
        if (circle) { Assert.IsTrue(output.Contains("fill=\"none\"")); Assert.IsTrue(output.Contains("stroke-width=\"10\"")); Assert.IsTrue(output.Contains("stroke=\"#0A141E\"")); }
        else { Assert.IsTrue(output.Contains("border-width: 10px")); Assert.IsTrue(output.Contains("border-color: #0A141E")); }
        Assert.IsFalse(output.Contains("background-color: #000028"));
        shape.BackFillPattern = 0; Assert.IsTrue((await Render()).Contains(circle ? "fill=\"#000028\"" : "background-color: #000028"));
        shape.BackFillPattern = 65536; shape.FillPattern = HmiFillPattern.Solid; Assert.IsTrue((await Render()).Contains(circle ? "fill=\"#000028\"" : "background-color: #000028"));
        shape.FillPattern = HmiFillPattern.Transparent; output = await Render(); Assert.IsFalse(output.Contains("background-color: #000028")); if (circle) Assert.IsTrue(output.Contains("fill=\"none\""));
    }
}
