using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;
[TestClass]
public class BarLabelRoundingHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        var values=new (double Value,int Places,bool Exponential,string Expected)[]{
            (.125,2,false,"0.12"),(.375,2,false,"0.38"),(.625,2,false,"0.62"),(.875,2,false,"0.88"),(-.625,2,false,"-0.62"),
            (1.25,1,false,"1.2"),(1.35,1,false,"1.4"),(1.005,2,false,"1.00"),(2.675,2,false,"2.67"),
            (1.25,1,true,"1.2e+000"),(12.5,0,true,"1e+001"),(625,1,true,"6.2e+002")};
        foreach(var direction in Enum.GetValues<HmiFillDirection>())foreach(var v in values)foreach(var tagged in new[]{false,true})
            yield return [direction,v.Value,v.Places,v.Exponential,v.Expected,tagged];
    }
    [TestMethod,DynamicData(nameof(Cases))]
    public async Task UsesExactDoubleNearestEvenLabelRounding(HmiFillDirection direction,double value,int places,bool exponential,string expected,bool tagged)
    {
        var bar=new HmiBar {BeginValue=value,EndValue=value+1,Value=value,ShowScale=true,DivisionCount=1,FillDirection=direction,TickLabelExponentialFormat=exponential,
            TickLabelDecimalPlaces=tagged?HmiProperty.Tag("Bar.Decimals",places):HmiProperty.Static(places)};
        var layer=new HmiLayer();layer.Items.Add(bar);var screen=new HmiScreen();screen.Layers.Add(layer);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var scale=Regex.Match(html,"<div[^>]*data-hmi-bar-scale[^>]*>(.*?)</div>").Groups[1].Value;
        StringAssert.Contains(scale,$"<span>{expected}</span>");Assert.AreEqual(value,bar.BeginValue.StaticValue);
    }
}
