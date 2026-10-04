using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Images;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass] public class SymbolLibraryRasterHtmlTests
{
    private static HmiImage Bmp()
    {var data=new byte[78];data[0]=(byte)'B';data[1]=(byte)'M';BitConverter.GetBytes(78).CopyTo(data,2);BitConverter.GetBytes(54).CopyTo(data,10);BitConverter.GetBytes(40).CopyTo(data,14);BitConverter.GetBytes(3).CopyTo(data,18);BitConverter.GetBytes(2).CopyTo(data,22);data[26]=1;data[28]=24;return new() {ImageType=HmiImageType.Bmp,Data=data};}
    private static ValueTask<string> Render(HmiSymbolLibraryControl control)
    {var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(control);return new HmiScreenToHtmlConverter().ConvertAsync(screen);}
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task TileRepeatsAtIntrinsicSizeAndSupportsInvisibleFlashing(bool blink)
    {var image=Bmp();var saved=(byte[])image.Data.Clone();var html=await Render(new() {Name="Texture",Symbol=image,RasterLayout=HmiSymbolLibraryRasterLayout.Tile,BlinkMode=blink?HmiSymbolLibraryBlinkMode.Invisible:HmiSymbolLibraryBlinkMode.NoFlashing,Width=12,Height=9});StringAssert.Contains(html,"data-hmi-symbol-tile=\"true\"");StringAssert.Contains(html,"background-repeat: repeat; background-position: 0 0; background-size: auto;");StringAssert.Contains(html,"data:image/bmp;base64,");Assert.AreEqual(blink,html.Contains("data-hmi-symbol-phase=\"normal\"",StringComparison.Ordinal));CollectionAssert.AreEqual(saved,image.Data);}
    [TestMethod] [DataRow(10,10,3,2,3,4)] [DataRow(2,2,2,1,0,0)] [DataRow(4,1,1,1,1,0)] [DataRow(100,100,3,2,48,49)]
    public async Task NativeScaleDownUsesIntegerAspectRatioAndDoesNotUpscale(int width,int height,int dw,int dh,int left,int top)
    {var html=await Render(new() {Symbol=Bmp(),RasterLayout=HmiSymbolLibraryRasterLayout.NativeScaleDown,Width=width,Height=height});StringAssert.Contains(html,$"position: absolute; left: {left}px; top: {top}px; width: {dw}px; height: {dh}px;");}
    [TestMethod] public async Task ExplicitStretchOverridesExistingAspectRatioPolicy()
    {StringAssert.Contains(await Render(new() {Symbol=Bmp(),RasterLayout=HmiSymbolLibraryRasterLayout.Stretch,FixedAspectRatio=true}),"object-fit: fill;");}
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)]
    public async Task UnsupportedRasterLayoutOrNativeDimensionsRemainPlaceholders(int kind)
    {var image=Bmp();if(kind==1)image.ImageType=HmiImageType.Png;if(kind==2)Array.Clear(image.Data,18,4);var html=await Render(new() {Symbol=image,RasterLayout=kind==0?(HmiSymbolLibraryRasterLayout)99:HmiSymbolLibraryRasterLayout.NativeScaleDown,Width=kind==3?double.NaN:10,Height=10});StringAssert.Contains(html,"Symbol library control");}
}
