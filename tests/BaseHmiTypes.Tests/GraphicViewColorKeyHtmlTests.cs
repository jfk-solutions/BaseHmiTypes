using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass]
public class GraphicViewColorKeyHtmlTests
{
    [TestMethod]
    [DataRow(false, false, false), DataRow(false, false, true), DataRow(false, true, false), DataRow(false, true, true)]
    [DataRow(true, false, false), DataRow(true, false, true), DataRow(true, true, false), DataRow(true, true, true)]
    public async Task EmitsColorKeyOnlyWhenEnabledAndConfigured(bool enabled, bool color, bool tagged)
    {
        var g = new HmiGraphicView { Name = "Key", Source = "picture.bmp", Width = 100, Height = 100,
            ImageBackgroundTransparent = tagged ? HmiProperty.Tag("Picture.Transparent", enabled) : HmiProperty.Static(enabled),
            ImageBackgroundColor = color ? tagged ? HmiProperty.Tag("Picture.Key", HmiColor.FromArgb(7, 255, 0, 128)) : HmiProperty.Static(HmiColor.FromArgb(7, 255, 0, 128)) : null };
        var s = new HmiScreen();var l = new HmiLayer();l.Items.Add(g);s.Layers.Add(l);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(s);
        Assert.AreEqual(enabled && color, html.Contains("data-hmi-image-color-key=\"255,0,128\""));
        StringAssert.Contains(html, "src=\"picture.bmp\"");
    }
}
