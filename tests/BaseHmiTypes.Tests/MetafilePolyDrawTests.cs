using System.Buffers.Binary;
using System.Xml.Linq;
using System.Text.RegularExpressions;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
using static BaseHmiTypes.Tests.MetafilePolyDrawFixtures;
namespace BaseHmiTypes.Tests;
[TestClass]
public class MetafilePolyDrawTests
{
    private static XElement Svg(byte[] bytes)=>XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,".emf")!).Root!;
    [TestMethod] [DataRow(56u)] [DataRow(92u)]
    public void DrawsMixedCommandsAndNativeCloseBit(uint type)
    {
        var bytes=Emf(PolyDraw(type));var original=bytes.ToArray();var path=Svg(bytes).Elements().Single();
        Assert.AreEqual(MixedPath,path.Attribute("d")?.Value);Assert.AreEqual("none",path.Attribute("fill")?.Value);CollectionAssert.AreEqual(original,bytes);
    }
    [TestMethod] [DataRow(56u)] [DataRow(92u)]
    public void RecordsMixedCommandsInPath(uint type)=>Assert.AreEqual(MixedPath,Svg(Emf(Record(59),PolyDraw(type),Record(60),Record(64,0,0,39,39))).Elements().Single().Attribute("d")?.Value);
    [TestMethod] [DataRow(56u)] [DataRow(92u)]
    public void CloseKeepsNativeEndpointAsCurrentPosition(uint type)
    {
        var line=Svg(Emf(PolyDraw(type),Record(54,39,35))).Elements().Single(e=>e.Name.LocalName=="line");Assert.AreEqual("35",line.Attribute("x1")?.Value);Assert.AreEqual("30",line.Attribute("y1")?.Value);
    }
    [TestMethod] [DataRow(56u)] [DataRow(92u)]
    public void DrawToWithoutMoveUsesExistingPosition(uint type)
        =>Assert.AreEqual("M 5 30 L 20 10",Svg(Emf(Record(27,5,30),PolyDraw(type,new byte[]{2},new[]{20,10}))).Elements().Single().Attribute("d")?.Value);
    [TestMethod] [DataRow(56u)] [DataRow(92u)]
    public void ImplicitCloseUsesMoveOriginRatherThanCurrentPosition(uint type)
        =>Assert.AreEqual("M 35 30 L 20 10 L 5 30",Svg(Emf(Record(27,5,30),Record(54,35,30),PolyDraw(type,new byte[]{3},new[]{20,10}))).Elements().Single(e=>e.Name.LocalName=="path").Attribute("d")?.Value);
    [TestMethod] [DataRow(56u)] [DataRow(92u)]
    public void SavedMoveOriginIsRestored(uint type)
        =>Assert.AreEqual("M 35 30 L 20 10 L 5 30",Svg(Emf(Record(27,5,30),Record(33),Record(27,8,8),Record(34,-1),Record(54,35,30),PolyDraw(type,new byte[]{3},new[]{20,10}))).Elements().Single(e=>e.Name.LocalName=="path").Attribute("d")?.Value);
    [TestMethod] [DataRow(56u)] [DataRow(92u)]
    public void MappingTransformsAllMixedPoints(uint type)
        =>Assert.AreEqual("M 14 97 L 14 37 C 14 7 74 7 74 97 Z",Svg(Emf(Record(9,10,10),Record(11,20,30),Record(12,4,7),PolyDraw(type))).Elements().Single().Attribute("d")?.Value);
    [TestMethod] [DataRow(56u)] [DataRow(92u)]
    public void InvalidCommandsNeverPaintPartialPrefixOrChangePosition(uint type)
    {
        foreach(var types in new[]{new byte[]{7,2,4,4,5},new byte[]{6,0x82,4,4,5},new byte[]{6,2,5,4,5},new byte[]{6,2,4,2,5},new byte[]{6,2,4,4,6}})
        {
            var svg=Svg(Emf(Record(27,1,2),PolyDraw(type,types),Record(54,8,9)));Assert.AreEqual(1,svg.Elements().Count());Assert.AreEqual("1",svg.Elements().Single().Attribute("x1")?.Value);Assert.AreEqual("2",svg.Elements().Single().Attribute("y1")?.Value);
        }
    }
    [TestMethod] [DataRow(56u)] [DataRow(92u)]
    public void MalformedCountsAndMissingTypesCannotReadFollowingRecords(uint type)
    {
        foreach(var count in new[]{0u,100u,uint.MaxValue}){var record=PolyDraw(type);BinaryPrimitives.WriteUInt32LittleEndian(record.AsSpan(24),count);Assert.AreEqual(0,Svg(Emf(record)).Elements().Count());}
        var partial=PolyDraw(type);Array.Resize(ref partial,partial.Length-4);BinaryPrimitives.WriteUInt32LittleEndian(partial.AsSpan(4),(uint)partial.Length);
        Assert.AreEqual(0,Svg(Emf(partial)).Elements().Count());Assert.AreEqual(0,Svg(Emf(Record(type,0,0,39,39))).Elements().Count());
    }
    [TestMethod] [DataRow(56u)] [DataRow(92u)]
    public void ExtraPaddingDoesNotBecomeCommands(uint type)
    {var record=PolyDraw(type);Array.Resize(ref record,record.Length+8);BinaryPrimitives.WriteUInt32LittleEndian(record.AsSpan(4),(uint)record.Length);Assert.AreEqual(MixedPath,Svg(Emf(record)).Elements().Single().Attribute("d")?.Value);}
    [TestMethod] public void Signed32BitCoordinatesAreNotTruncated()
        =>Assert.AreEqual("M -70000 80000 L -2147483648 2147483647",Svg(Emf(PolyDraw(56,new byte[]{6,2},new[]{-70000,80000,int.MinValue,int.MaxValue}))).Elements().Single().Attribute("d")?.Value);
    [TestMethod] [DataRow(56u)] [DataRow(92u)]
    public async Task HtmlRetainsMixedShapeAndOriginalSource(uint type)
    {
        var uri="data:image/emf;base64,"+Convert.ToBase64String(Emf(PolyDraw(type)));var item=new HmiGraphicView{Name="PolyDraw",Source=uri};var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var match=Regex.Match(html,"src=\"data:image/svg\\+xml;charset=utf-8,([^\"]+)\"");Assert.IsTrue(match.Success);
        Assert.AreEqual(MixedPath,XDocument.Parse(Uri.UnescapeDataString(match.Groups[1].Value)).Root!.Elements().Single().Attribute("d")?.Value);Assert.AreEqual(uri,item.Source!.StaticValue);
    }
}
