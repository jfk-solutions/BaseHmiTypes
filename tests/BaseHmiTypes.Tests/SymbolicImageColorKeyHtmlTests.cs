using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;
[TestClass]
public class SymbolicImageColorKeyHtmlTests
{
    public static IEnumerable<object?[]> Cases()
    {
        foreach(var baseKey in new bool?[]{null,false,true})foreach(var flashKey in new bool?[]{null,false,true})
        foreach(var blink in new[]{false,true})foreach(var color in new[]{false,true})foreach(var scaled in new[]{false,true})yield return [baseKey,flashKey,blink,color,scaled];
    }
    [TestMethod,DynamicData(nameof(Cases))]
    public async Task UsesIndependentKeysOnSelectedStateImages(bool? baseKey,bool? flashKey,bool blink,bool color,bool scaled)
    {
        var field=new HmiSymbolicIOField{Name="Key",Width=160,Height=100,Value=1};
        field.States.Add(new HmiState{Value=0,Image=new HmiImageSource{Uri="ignored.svg"},ImageBackgroundTransparent=true,ImageBackgroundColor=HmiColor.FromArgb(255,99,99,99)});
        field.States.Add(new HmiState{Value=1,Image=new HmiImageSource{Uri="base.svg"},AlternateImage=new HmiImageSource{Uri="flash.svg"},ImageBlink=blink,ImageScaled=scaled,
            ImageBackgroundTransparent=baseKey,ImageBackgroundColor=color?HmiColor.FromArgb(255,1,2,3):null,AlternateImageBackgroundTransparent=flashKey,AlternateImageBackgroundColor=color?HmiColor.FromArgb(255,4,5,6):null});
        var s=new HmiScreen();var l=new HmiLayer();l.Items.Add(field);s.Layers.Add(l);var html=await new HmiScreenToHtmlConverter().ConvertAsync(s);
        var b=Regex.Match(html,"<img[^>]*class=\"hmi-symbolic-image-base\"[^>]*>").Value;
        var f=Regex.Match(html,"<img[^>]*class=\"hmi-symbolic-image-alternate\"[^>]*>").Value;
        StringAssert.Contains(b,"src=\"base.svg\"");Assert.AreEqual(baseKey==true&&color,b.Contains("data-hmi-image-color-key=\"1,2,3\""));
        Assert.AreEqual(blink,f.Length>0);if(blink){StringAssert.Contains(f,"src=\"flash.svg\"");Assert.AreEqual(flashKey==true&&color,f.Contains("data-hmi-image-color-key=\"4,5,6\""));}
        StringAssert.Contains(b,scaled?"object-fit: contain":"width: auto");
    }
}
