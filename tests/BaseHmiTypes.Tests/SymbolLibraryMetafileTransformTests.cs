using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Images;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass] public class SymbolLibraryMetafileTransformTests
{
    internal static byte[] Wmf(params (ushort Code,short[] Values)[] records)
    {
        using var stream=new MemoryStream();using var writer=new BinaryWriter(stream);
        writer.Write(Convert.FromHexString("0100090000030000000000000A0000000000"));
        foreach(var (code,values) in records){writer.Write((uint)(3+values.Length));writer.Write(code);foreach(var value in values)writer.Write(value);}
        writer.Write(3u);writer.Write((ushort)0);var bytes=stream.ToArray();BitConverter.GetBytes((uint)bytes.Length/2).CopyTo(bytes,6);return bytes;
    }
    [TestMethod]
    [DataRow(0,0,20,10)] [DataRow(1,0,80,10)] [DataRow(2,0,20,40)] [DataRow(3,0,80,40)]
    [DataRow(0,1,10,80)] [DataRow(1,1,10,20)] [DataRow(2,1,40,80)] [DataRow(3,1,40,20)]
    [DataRow(0,2,80,40)] [DataRow(1,2,20,40)] [DataRow(2,2,80,10)] [DataRow(3,2,20,10)]
    [DataRow(0,3,40,20)] [DataRow(1,3,40,80)] [DataRow(2,3,10,20)] [DataRow(3,3,10,80)]
    public async Task NativeFlipAndRotationGoldenPointsAndStableHtmlHost(int flip,int rotation,int x,int y)
    {
        var bytes=Wmf((0x20b,[0,0]),(0x20c,[50,100]),(0x324,[1,20,10]));var saved=(byte[])bytes.Clone();
        var result=SymbolLibraryMetafileTransformer.TryTransform(bytes,(HmiSymbolLibraryFlip)flip,(HmiSymbolLibraryRotation)rotation);Assert.IsNotNull(result);
        Assert.AreEqual((short)x,BitConverter.ToInt16(result,46));Assert.AreEqual((short)y,BitConverter.ToInt16(result,48));
        Assert.AreEqual((short)(rotation%2==1?100:50),BitConverter.ToInt16(result,34));CollectionAssert.AreEqual(saved,bytes);
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);
        layer.Items.Add(new HmiSymbolLibraryControl {Name="Transform",Width=120,Height=80,Symbol=new HmiImage {ImageType=HmiImageType.Wmf,Data=bytes},
            Flip=(HmiSymbolLibraryFlip)flip,Rotation=(HmiSymbolLibraryRotation)rotation});
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html,$"points=\"{x},{y}\"");StringAssert.Contains(html,"width: 120px;height: 80px;");
        var host=System.Text.RegularExpressions.Regex.Match(html,"<div id=\"Transform\"[^>]*>").Value;
        Assert.IsFalse(host.Contains("transform:",StringComparison.Ordinal));
    }
    [TestMethod] [DataRow(0,30,-30)] [DataRow(1,0,60)] [DataRow(2,90,-60)] [DataRow(3,-30,0)]
    public void NonzeroOriginsAndNegativeExtentsRetainNativeCoordinates(int rotation,int x,int y)
    {
        var bytes=Wmf((0x20b,[-20,10]),(0x20c,[-50,100]),(0x325,[1,30,-30]));
        var result=SymbolLibraryMetafileTransformer.TryTransform(bytes,HmiSymbolLibraryFlip.None,(HmiSymbolLibraryRotation)rotation)!;
        Assert.AreEqual((short)x,BitConverter.ToInt16(result,46));Assert.AreEqual((short)y,BitConverter.ToInt16(result,48));
    }
    [TestMethod] public void PolyPolygonTransformsEveryPolygonAndPreservesExtensions()
    {
        var bytes=Wmf((0x20b,[0,0]),(0x20c,[50,100]),(0x538,[2,1,2,20,10,40,15,60,25]));byte[] full=[..bytes,0xde,0xad];
        var result=SymbolLibraryMetafileTransformer.TryTransform(full,HmiSymbolLibraryFlip.Horizontal,HmiSymbolLibraryRotation.Angle0)!;
        foreach(var (offset,expected) in new[]{(50,80),(54,60),(58,40)})Assert.AreEqual((short)expected,BitConverter.ToInt16(result,offset));
        CollectionAssert.AreEqual(full[^2..],result[^2..]);Assert.AreNotSame(full,result);
    }
    [TestMethod] public void MoveLineAndRectangleKeepNativeRecordSpecificRotationFormulas()
    {
        var bytes=Wmf((0x20b,[0,0]),(0x20c,[50,100]),(0x214,[10,20]),(0x213,[15,40]),(0x41b,[30,80,10,20]));
        var result=SymbolLibraryMetafileTransformer.TryTransform(bytes,HmiSymbolLibraryFlip.None,HmiSymbolLibraryRotation.Angle270)!;
        Assert.AreEqual((short)30,BitConverter.ToInt16(result,44));Assert.AreEqual((short)10,BitConverter.ToInt16(result,46));
        Assert.AreEqual((short)10,BitConverter.ToInt16(result,54));Assert.AreEqual((short)15,BitConverter.ToInt16(result,56));
        Assert.AreEqual((short)20,BitConverter.ToInt16(result,64));Assert.AreEqual((short)70,BitConverter.ToInt16(result,66));
    }
    [TestMethod] public void SignedCoordinatesWrapLikeNativeShortAssignments()
    {
        var bytes=Wmf((0x20b,[0,30000]),(0x20c,[50,30000]),(0x324,[1,-30000,10]));
        var result=SymbolLibraryMetafileTransformer.TryTransform(bytes,HmiSymbolLibraryFlip.Horizontal,HmiSymbolLibraryRotation.Angle0)!;
        Assert.AreEqual(unchecked((short)120000),BitConverter.ToInt16(result,46));
    }
    [TestMethod] public void TruncationsUnknownEnumsAndShortGeometryRecordsAreRejected()
    {
        var bytes=Wmf((0x20b,[0,0]),(0x20c,[50,100]),(0x324,[1,20,10]));
        for(var n=0;n<bytes.Length;n++)Assert.IsNull(SymbolLibraryMetafileTransformer.TryTransform(bytes[..n],HmiSymbolLibraryFlip.Horizontal,HmiSymbolLibraryRotation.Angle90));
        Assert.IsNull(SymbolLibraryMetafileTransformer.TryTransform(bytes,(HmiSymbolLibraryFlip)99,HmiSymbolLibraryRotation.Angle0));
        Assert.IsNull(SymbolLibraryMetafileTransformer.TryTransform(bytes,HmiSymbolLibraryFlip.None,(HmiSymbolLibraryRotation)99));
        foreach(var record in new (ushort,short[])[]{(0x20b,[]),(0x20c,[]),(0x213,[]),(0x214,[]),(0x324,[2,20,10]),(0x325,[-1]),(0x538,[2,1]),(0x418,[]),(0x41b,[]),(0x41f,[])})
            Assert.IsNull(SymbolLibraryMetafileTransformer.TryTransform(Wmf(record),HmiSymbolLibraryFlip.Horizontal,HmiSymbolLibraryRotation.Angle90));
    }
}
