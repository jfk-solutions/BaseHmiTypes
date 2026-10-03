using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass]
public class SelectionIndicatorAlignmentHtmlTests
{
    [TestMethod]
    [DataRow(false,false,false)]
    [DataRow(false,false,true)]
    [DataRow(false,true,false)]
    [DataRow(false,true,true)]
    [DataRow(true,false,false)]
    [DataRow(true,false,true)]
    [DataRow(true,true,false)]
    [DataRow(true,true,true)]
    public async Task EmitsIndicatorSide(bool radio,bool right,bool tagged)
    {
        HmiSelectionGroupBase item=radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup();item.Name="Aligned";
        HmiProperty<bool> side=tagged?HmiProperty.Tag("Box.Alignment",right):HmiProperty.Static(right);
        if(item is HmiCheckBoxGroup check)check.IndicatorOnRight=side;else((HmiRadioButtonGroup)item).IndicatorOnRight=side;
        var layer=new HmiLayer();layer.Items.Add(item);var screen=new HmiScreen();screen.Layers.Add(layer);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var opening=System.Text.RegularExpressions.Regex.Match(html,"<hmi-(?:checkbox|radio-button)-group id=\"Aligned\"[^>]*>").Value;
        StringAssert.Contains(opening,"indicator-on-right=\""+(right?"true":"false")+"\"");
    }
    [TestMethod]
    [DataRow(false)]
    [DataRow(true)]
    public async Task OmitsUnspecifiedSide(bool radio)
    {
        HmiSelectionGroupBase item=radio?new HmiRadioButtonGroup():new HmiCheckBoxGroup();item.Name="Aligned";
        var layer=new HmiLayer();layer.Items.Add(item);var screen=new HmiScreen();screen.Layers.Add(layer);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var opening=System.Text.RegularExpressions.Regex.Match(html,"<hmi-(?:checkbox|radio-button)-group id=\"Aligned\"[^>]*>").Value;
        Assert.IsFalse(opening.Contains("indicator-on-right",StringComparison.Ordinal));
    }
}
