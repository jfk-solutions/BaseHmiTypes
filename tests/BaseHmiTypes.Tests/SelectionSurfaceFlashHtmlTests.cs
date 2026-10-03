using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass]
public class SelectionSurfaceFlashHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach(var radio in new[]{false,true})
        foreach(var flags in new[]{0,1,2,3})
        foreach(var rate in Enum.GetValues<HmiBlinkRate>())
        foreach(var conditional in new[]{false,true}) yield return [radio,flags,rate,conditional];
    }
    private static string Duration(HmiBlinkRate rate) => rate == HmiBlinkRate.Slow ? "2" : rate == HmiBlinkRate.Fast ? "0.5" : "1";
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task EmitsIndependentSurfaceFlashDurations(bool radio,int flags,HmiBlinkRate rate,bool conditional)
    {
        HmiSelectionGroupBase item=radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup();
        item.Name="Surface";item.BorderWidth=8;
        var next=(HmiBlinkRate)(((int)rate+1)%4);
        var off=HmiColor.FromArgb(255,11,12,13);var on=HmiColor.FromArgb(255,14,15,16);
        var condition=conditional?HmiBlinkCondition.WhenTrue:HmiBlinkCondition.Always;
        item.ForegroundColor=(flags&1)!=0?HmiProperty.Blink(off,on,rate,condition,"Surface.Foreground"):HmiProperty.Static(off);
        item.BackgroundColor=(flags&2)!=0?HmiProperty.Blink(off,on,next,condition,"Surface.Background"):HmiProperty.Static(off);
        item.BorderColor=HmiProperty.Blink(off,on,HmiBlinkRate.Medium);
        var layer=new HmiLayer();layer.Items.Add(item);var screen=new HmiScreen();screen.Layers.Add(layer);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var opening=System.Text.RegularExpressions.Regex.Match(html,"<hmi-(?:checkbox|radio-button)-group id=\"Surface\"[^>]*>").Value;
        foreach(var channel in new[]{"foreground","background"})
        {
            var enabled=(flags&(channel=="foreground"?1:2))!=0;
            Assert.AreEqual(enabled,opening.Contains(channel+"-flash-duration=",StringComparison.Ordinal));
            if(enabled)StringAssert.Contains(opening,channel+"-flash-duration=\""+Duration(channel=="foreground"?rate:next)+"\"");
        }
        StringAssert.Contains(opening,"frame-border-flash-duration=\"1\"");
    }
}
