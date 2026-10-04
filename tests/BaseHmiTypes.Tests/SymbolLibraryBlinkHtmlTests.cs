using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Images;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass] public class SymbolLibraryBlinkHtmlTests
{
    private static ValueTask<string> Render(HmiSymbolLibraryControl control)
    {var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(control);return new HmiScreenToHtmlConverter().ConvertAsync(screen);}
    [TestMethod]
    [DataRow(1,0,1000)] [DataRow(1,1,500)] [DataRow(1,2,250)]
    [DataRow(2,0,1000)] [DataRow(2,1,500)] [DataRow(2,2,250)]
    [DataRow(3,0,1000)] [DataRow(3,1,500)] [DataRow(3,2,250)]
    public async Task ExistingWmfSymbolsFlashBetweenCorrectFramesAtNominalIntervals(int mode,int speed,int interval)
    {
        var image=new HmiImage {ImageType=HmiImageType.Wmf,Data=SymbolLibraryMetafileColorTests.Wmf()};var saved=(byte[])image.Data.Clone();
        var html=await Render(new() {Name="Flash",Symbol=image,BlinkMode=(HmiSymbolLibraryBlinkMode)mode,BlinkSpeed=(HmiSymbolLibraryBlinkSpeed)speed,
            BlinkColor=HmiColor.FromArgb(255,200,100,50),BackFillStyle=HmiSymbolLibraryBackFillStyle.Solid,BackColor=HmiColor.FromArgb(255,17,34,51),FixedAspectRatio=true});
        StringAssert.Contains(html,$"data-hmi-symbol-blink-interval=\"{interval}\"");StringAssert.Contains(html,$"hmi-symbol-on {interval*2}ms step-end infinite");
        StringAssert.Contains(html,"data-hmi-symbol-phase=\"normal\"");StringAssert.Contains(html,"fill=\"#7f7f7f\"");
        StringAssert.Contains(html,"background-color: #112233;");StringAssert.Contains(html,"prefers-reduced-motion:reduce");
        Assert.AreEqual(mode!=3,html.Contains("data-hmi-symbol-phase=\"alternate\"",StringComparison.Ordinal));
        StringAssert.Contains(html,$"data-hmi-symbol-phase=\"normal\" style=\"position: absolute; inset: 0; opacity: {(mode==3?1:0)};");
        if(mode!=3)StringAssert.Contains(html,$"fill=\"{(mode==1?"#c86432":"#c76331")}\"");
        CollectionAssert.AreEqual(saved,image.Data);
    }
    [TestMethod] public async Task NoFlashingDoesNotCreateAnimationOrUseBlinkColor()
    {
        var html=await Render(new() {Symbol=new HmiImage {ImageType=HmiImageType.Wmf,Data=SymbolLibraryMetafileColorTests.Wmf()},BlinkMode=HmiSymbolLibraryBlinkMode.NoFlashing,BlinkSpeed=(HmiSymbolLibraryBlinkSpeed)99});
        Assert.IsFalse(html.Contains("data-hmi-symbol-phase=",StringComparison.Ordinal));StringAssert.Contains(html,"<polygon");
    }
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task InvisibleModeSupportsExistingRasterAndSvgSymbols(bool svg)
    {
        var image=new HmiImage {ImageType=svg?HmiImageType.Svg:HmiImageType.Png,Data=svg?System.Text.Encoding.UTF8.GetBytes("<svg xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"10\" height=\"10\"/></svg>"):[1,2,3]};
        var html=await Render(new() {Symbol=image,BlinkMode=HmiSymbolLibraryBlinkMode.Invisible});
        StringAssert.Contains(html,"data-hmi-symbol-phase=\"normal\"");StringAssert.Contains(html,"data-hmi-symbol-blink-interval=\"500\"");
        Assert.IsFalse(html.Contains("data-hmi-symbol-phase=\"alternate\"",StringComparison.Ordinal));
    }
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(3)]
    public async Task UnsupportedModesSpeedsColorsAndColoredNonWmfFramesStayPlaceholders(int kind)
    {
        var control=new HmiSymbolLibraryControl {Symbol=new HmiImage {ImageType=kind==3?HmiImageType.Svg:HmiImageType.Wmf,Data=SymbolLibraryMetafileColorTests.Wmf()},
            BlinkMode=kind==0?(HmiSymbolLibraryBlinkMode)99:HmiSymbolLibraryBlinkMode.Solid,BlinkSpeed=kind==1?(HmiSymbolLibraryBlinkSpeed)99:HmiSymbolLibraryBlinkSpeed.Medium,
            BlinkColor=kind==2?null:HmiProperty.Static(HmiColor.FromArgb(255,1,2,3))};
        StringAssert.Contains(await Render(control),"Symbol library control");
    }
    [TestMethod] [DataRow(1)] [DataRow(123)] [DataRow(32767)]
    public async Task ExplicitIntervalOverridesPreset(int interval)
    {
        var html=await Render(new() {Symbol=new HmiImage {ImageType=HmiImageType.Wmf,Data=SymbolLibraryMetafileColorTests.Wmf()},BlinkMode=HmiSymbolLibraryBlinkMode.Invisible,
            BlinkSpeed=HmiSymbolLibraryBlinkSpeed.Slow,BlinkIntervalMilliseconds=interval});
        StringAssert.Contains(html,$"data-hmi-symbol-blink-interval=\"{interval}\"");StringAssert.Contains(html,$"hmi-symbol-on {interval*2}ms");
    }
    [TestMethod] [DataRow(0)] [DataRow(-1)] [DataRow(int.MaxValue)]
    public async Task InvalidIntervalsDoNotOverflowOrAnimate(int interval)
    {
        StringAssert.Contains(await Render(new() {Symbol=new HmiImage {ImageType=HmiImageType.Wmf,Data=SymbolLibraryMetafileColorTests.Wmf()},
            BlinkMode=HmiSymbolLibraryBlinkMode.Invisible,BlinkIntervalMilliseconds=interval}),"Symbol library control");
    }
}
