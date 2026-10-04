using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Images;
using BaseHmiTypes.Images.Converters;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass] public class SymbolLibraryMetafileColorTests
{
    internal static byte[] Wmf(uint color=0x7f7f7f)
    {
        using var stream=new MemoryStream();using var writer=new BinaryWriter(stream);
        writer.Write(Convert.FromHexString("0100090000030000000002000A0000000000"));
        writer.Write(7u);writer.Write((ushort)0x2fc);writer.Write((ushort)0);writer.Write(color);writer.Write((ushort)0);
        writer.Write(Convert.FromHexString("08000000FA0200000100000011223300040000002D010000040000002D010100050000000B0200000000050000000C02640064000A000000240303000A000A005A000A0032005A00030000000000"));
        var bytes=stream.ToArray();BitConverter.GetBytes((uint)bytes.Length/2).CopyTo(bytes,6);return bytes;
    }
    private static readonly HmiColor Target=HmiColor.FromArgb(255,200,100,50);
    [TestMethod] [DataRow(0u,0u)] [DataRow(0xffffffu,0xffffffu)] [DataRow(0x7f7f7fu,0x3163c7u)]
    [DataRow(0xc0c0c0u,0x99b2e3u)] [DataRow(0x010203u,0x000103u)] [DataRow(0xff0000u,0x214285u)]
    public void NativeShadingGoldenColors(uint source,uint expected)
    {
        var result=SymbolLibraryMetafileColorizer.TryRecolor(Wmf(source),HmiSymbolLibraryFillColorMode.Shaded,Target);
        Assert.IsNotNull(result);Assert.AreEqual(expected,BitConverter.ToUInt32(result,26));
    }
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)]
    public void ColorsBrushOnlyPreservingOriginalAndExtensions(int mode)
    {
        var original=Wmf();byte[] bytes=[..original,0xde,0xad];var saved=(byte[])bytes.Clone();
        var result=SymbolLibraryMetafileColorizer.TryRecolor(bytes,(HmiSymbolLibraryFillColorMode)mode,Target);Assert.IsNotNull(result);
        CollectionAssert.AreEqual(saved,bytes);Assert.AreNotSame(bytes,result);
        CollectionAssert.AreEqual(bytes[32..],result[32..]);
        if(mode==0)CollectionAssert.AreEqual(bytes,result);
        if(mode==2)Assert.AreEqual(0x3264c8u,BitConverter.ToUInt32(result,26));
        if(mode==3)Assert.AreEqual((ushort)1,BitConverter.ToUInt16(result,24));
    }
    [TestMethod] public void TruncatedMalformedAndUnsupportedInputsAreRejected()
    {
        var bytes=Wmf();for(var n=0;n<bytes.Length;n++)Assert.IsNull(SymbolLibraryMetafileColorizer.TryRecolor(bytes[..n],HmiSymbolLibraryFillColorMode.Solid,Target));
        foreach(var offset in new[]{0,2,4,6,18,bytes.Length-2}) {var bad=(byte[])bytes.Clone();bad[offset]=255;Assert.IsNull(SymbolLibraryMetafileColorizer.TryRecolor(bad,HmiSymbolLibraryFillColorMode.Solid,Target));}
        Assert.IsNull(SymbolLibraryMetafileColorizer.TryRecolor(bytes,(HmiSymbolLibraryFillColorMode)99,Target));
        Assert.IsNull(SymbolLibraryMetafileColorizer.TryRecolor(bytes,HmiSymbolLibraryFillColorMode.Solid));
        Assert.IsNull(SymbolLibraryMetafileColorizer.TryRecolor(bytes,HmiSymbolLibraryFillColorMode.Shaded,HmiColor.FromArgb(128,1,2,3)));
    }
    [TestMethod] [DataRow(0,"#7F7F7F")] [DataRow(1,"#C76331")] [DataRow(2,"#C86432")] [DataRow(3,"none")]
    public async Task ExistingNeutralWmfSymbolsRenderColorModes(int mode,string expected)
    {
        var image=new HmiImage {ImageType=HmiImageType.Wmf,Data=Wmf()};var saved=(byte[])image.Data.Clone();
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);
        layer.Items.Add(new HmiSymbolLibraryControl {Name="Color",Symbol=image,SymbolAppearance=(HmiSymbolLibraryFillColorMode)mode,ForeColor=Target});
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html,$"fill=\"{expected}\"",StringComparison.OrdinalIgnoreCase);StringAssert.Contains(html,"stroke=\"#112233\"");
        CollectionAssert.AreEqual(saved,image.Data);
    }
    [TestMethod] public async Task UnsupportedRecoloringDoesNotSilentlyRenderOriginal()
    {
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);
        layer.Items.Add(new HmiSymbolLibraryControl {Symbol=new HmiImage {ImageType=HmiImageType.Wmf,Data=Wmf()},FillColorMode=HmiSymbolLibraryFillColorMode.Solid});
        StringAssert.Contains(await new HmiScreenToHtmlConverter().ConvertAsync(screen),"Symbol library control");
    }
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)]
    public async Task WmfIdentityAndFillPropertyAliasesAreSupported(int identity)
    {
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);
        layer.Items.Add(new HmiSymbolLibraryControl {Symbol=new HmiImage {ImageType=identity==0?HmiImageType.Wmf:HmiImageType.Unknown,
            Name=identity==1?"symbol.WMF":null,MimeType=identity==2?"image/x-wmf":null,Data=Wmf()},FillColorMode=HmiSymbolLibraryFillColorMode.Solid,FillColor=Target});
        StringAssert.Contains(await new HmiScreenToHtmlConverter().ConvertAsync(screen),"fill=\"#c86432\"");
    }
    [TestMethod] public async Task AppearanceAndForeColorTakePrecedenceOverAliases()
    {
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);
        layer.Items.Add(new HmiSymbolLibraryControl {Symbol=new HmiImage {ImageType=HmiImageType.Wmf,Data=Wmf()},
            SymbolAppearance=HmiSymbolLibraryFillColorMode.Shaded,FillColorMode=HmiSymbolLibraryFillColorMode.Solid,ForeColor=Target,FillColor=HmiColor.FromArgb(255,1,2,3)});
        StringAssert.Contains(await new HmiScreenToHtmlConverter().ConvertAsync(screen),"fill=\"#c76331\"");
    }
}
