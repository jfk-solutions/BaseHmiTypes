using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;
[TestClass]
public class SelectionSurfaceFillHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach(var radio in new[]{false,true})
        foreach(var pattern in new[]{HmiFillPattern.Transparent,HmiFillPattern.Solid,HmiFillPattern.Horizontal,HmiFillPattern.Checkers,HmiFillPattern.DiagonalCross})
        foreach(var tagged in new[]{false,true}) yield return [radio,pattern,tagged];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task EmitsSurfaceColorAndHostPattern(bool radio,HmiFillPattern pattern,bool tagged)
    {
        var item=Create(radio);var color=HmiColor.FromArgb(255,230,240,250);
        item.BackgroundColor=tagged?HmiProperty.Tag("Box.Background",color):HmiProperty.Static(color);
        item.FillPattern=tagged?HmiProperty.Tag("Box.Pattern",pattern):HmiProperty.Static(pattern);
        item.PatternColor=HmiColor.FromArgb(255,128,64,0);
        var opening=Opening(await Convert(item));
        StringAssert.Contains(opening,"surface-background-color=\""+(pattern==HmiFillPattern.Transparent?"transparent":"#E6F0FA")+"\"");
        if(pattern is not HmiFillPattern.Transparent and not HmiFillPattern.Solid){
            StringAssert.Contains(opening,"background-image:");StringAssert.Contains(opening,"#804000");StringAssert.Contains(opening,"background-size: 8px 8px;");
        }
    }
    [TestMethod]
    [DataRow(false,false)] [DataRow(false,true)] [DataRow(true,false)] [DataRow(true,true)]
    public async Task KeepsConfiguredGradients(bool radio,bool vertical)
    {
        var item=Create(radio);item.BackgroundColor=HmiColor.FromArgb(255,0,0,255);
        item.UseFirstGradient=true;item.FirstGradientColor=HmiColor.FromArgb(255,255,0,0);
        item.GradientDirection=vertical?HmiGradientDirection.VerticalFromTop:HmiGradientDirection.HorizontalFromLeft;
        var opening=Opening(await Convert(item));
        StringAssert.Contains(opening,"surface-background-color=\"#0000FF\"");
        StringAssert.Contains(opening,"background-image: linear-gradient("+(vertical?"to bottom":"to right"));
    }
    [TestMethod]
    [DataRow(false,false)] [DataRow(false,true)] [DataRow(true,false)] [DataRow(true,true)]
    public async Task KeepsAlphaZeroBackground(bool radio,bool tagged)
    {
        var item=Create(radio);var color=HmiColor.FromArgb(0,230,240,250);
        item.BackgroundColor=tagged?HmiProperty.Tag("Box.Background",color):HmiProperty.Static(color);
        StringAssert.Contains(Opening(await Convert(item)),"surface-background-color=\"rgba(230,240,250,0)\"");
    }
    [TestMethod]
    [DataRow(false)] [DataRow(true)]
    public async Task KeepsBlinkFallbackColor(bool radio)
    {
        var item=Create(radio);item.BackgroundColor=new HmiBlinkProperty<HmiColor>{StaticValue=HmiColor.FromArgb(255,255,0,0),BlinkValue=HmiColor.FromArgb(255,0,0,255),Rate=HmiBlinkRate.Medium};
        var opening=Opening(await Convert(item));
        StringAssert.Contains(opening,"surface-background-color=\"#FF0000\"");StringAssert.Contains(opening,"background-flash-duration=\"1\"");
    }
    [TestMethod]
    [DataRow(false)] [DataRow(true)]
    public async Task OmitsUnspecifiedSurfaceColor(bool radio)
    {
        Assert.IsFalse(Opening(await Convert(Create(radio))).Contains("surface-background-color",StringComparison.Ordinal));
    }
    private static HmiSelectionGroupBase Create(bool radio)=>radio?new HmiRadioButtonGroup{Name="Filled"}:new HmiCheckBoxGroup{Name="Filled"};
    private static string Opening(string html)=>Regex.Match(html,"<hmi-(?:checkbox|radio-button)-group id=\"Filled\"[^>]*>").Value;
    private static ValueTask<string> Convert(HmiSelectionGroupBase item){var layer=new HmiLayer();layer.Items.Add(item);var screen=new HmiScreen();screen.Layers.Add(layer);return new HmiScreenToHtmlConverter().ConvertAsync(screen);}
}
