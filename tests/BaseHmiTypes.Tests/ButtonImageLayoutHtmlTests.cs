using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;

namespace BaseHmiTypes.Tests;

[TestClass]
public class ButtonImageLayoutHtmlTests
{
    [TestMethod]
    [DataRow(0, "none")]
    [DataRow(1, "fill")]
    [DataRow(2, "contain")]
    [DataRow(3, "cover")]
    public async Task ButtonImageHonorsStretchAndExplicitPadding(int stretch, string fit)
    {
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer);
        var button = new HmiButton { Name = "Icon", Mode = HmiButtonType.Graphic,
            Image = new HmiImageSource { Uri = "data:image/png;base64,AA==" }, GraphicStretchMode = stretch };
        layer.Items.Add(button);
        var converter = new HmiScreenToHtmlConverter();
        var html = await converter.ConvertAsync(screen);
        StringAssert.Contains(html, "padding: 0;");
        StringAssert.Contains(html, "object-fit: " + fit + ";");
        button.Padding = new HmiThickness { Left = 5, Right = 5, Top = 2, Bottom = 2 };
        html = await converter.ConvertAsync(screen);
        Assert.IsFalse(html.Contains("padding: 0;"));
    }
}
