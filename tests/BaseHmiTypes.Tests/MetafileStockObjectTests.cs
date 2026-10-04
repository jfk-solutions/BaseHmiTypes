using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;using BaseHmiTypes.Screens.Base;using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Xml.Linq;using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;

[TestClass] public class MetafileStockObjectTests
{
    private static XElement[] Rectangles(byte[] bytes)=>XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,".emf")!).Descendants().Where(e=>e.Name.LocalName=="rect").ToArray();
    [TestMethod] [DataRow(0,"#ffffff")] [DataRow(1,"#c0c0c0")] [DataRow(2,"#808080")] [DataRow(3,"#404040")] [DataRow(4,"#000000")] [DataRow(5,"none")]
    public void StockBrushReplacesAnExplicitlySelectedBrush(int stock,string fill)
    {
        var bytes=MetafileStockFixtures.Emf(0x80000000u+(uint)stock);var original=bytes.ToArray();var rect=Rectangles(bytes).Single();
        Assert.AreEqual(fill,rect.Attribute("fill")!.Value);Assert.AreEqual("#000000",rect.Attribute("stroke")!.Value);CollectionAssert.AreEqual(original,bytes);
    }
    [TestMethod] [DataRow(0,"#ffffff")] [DataRow(1,"#c0c0c0")] [DataRow(2,"#808080")] [DataRow(3,"#404040")] [DataRow(4,"#000000")] [DataRow(5,"none")]
    public void RestoreDcRestoresTheBrushSelectedBeforeTheStockObject(int stock,string fill)
    {
        var rects=Rectangles(MetafileStockFixtures.Emf(0x80000000u+(uint)stock,true));Assert.HasCount(2,rects);
        Assert.AreEqual(fill,rects[0].Attribute("fill")!.Value);Assert.AreEqual("#ff0000",rects[1].Attribute("fill")!.Value);
    }
    [TestMethod] [DataRow(6,"#ffffff")] [DataRow(7,"#000000")] [DataRow(8,"none")]
    public void StockPensReplaceAnExplicitPenWithoutAddingFill(int stock,string stroke)
    {
        var rect=Rectangles(MetafileStockFixtures.Emf(0x80000000u+(uint)stock,pen:true)).Single();Assert.AreEqual(stroke,rect.Attribute("stroke")!.Value);Assert.AreEqual("none",rect.Attribute("fill")!.Value);
    }
    [TestMethod] [DataRow(1u)] [DataRow(0x80000009u)]
    public void OrdinaryAndUnknownStockHandlesDoNotSelectAnUnrelatedBrush(uint handle)
        =>Assert.AreEqual("#ff0000",Rectangles(MetafileStockFixtures.Emf(handle)).Single().Attribute("fill")!.Value);
    [TestMethod] [DataRow(2,"#808080")] [DataRow(5,"none")]
    public async Task StockBrushImagesReachTheHtmlRendererWithoutRewritingSource(int stock,string expected)
    {
        var uri="data:image/emf;base64,"+Convert.ToBase64String(MetafileStockFixtures.Emf(0x80000000u+(uint)stock));
        var item=new HmiGraphicView{Name="Stock",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);
        var rect=XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Descendants().Single(e=>e.Name.LocalName=="rect");Assert.AreEqual(expected,rect.Attribute("fill")!.Value);Assert.AreEqual(uri,item.Source!.StaticValue);
    }
}
