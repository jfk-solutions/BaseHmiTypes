using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass]
public class ParameterBarLayoutHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task BarLayoutAndEnablementRemainIndependent(bool detailed)
    {
        HmiParameterControlBase control=detailed?new HmiDetailedParameterControl():new HmiOverviewParameterControl();var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);var renderer=new HmiScreenToHtmlConverter();control.ShowToolbar=true;control.ShowStatusBar=true;
        async Task<string> Html()=>HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(screen));
        string Bar(string html,string name)=>Regex.Match(html,"<div class=\"hmi-parameter-"+name+"\"[^>]*>").Value;
        var html=await Html();Assert.IsFalse(html.Contains("data-toolbar-enabled"));Assert.IsFalse(Bar(html,"toolbar").Contains("aria-disabled"));StringAssert.Contains(Bar(html,"toolbar"),"padding: 2px 4px;");
        control.ToolbarEnabled=false;control.ToolbarShowToolTips=true;control.ToolbarPaddingLeft=0d;control.ToolbarPaddingTop=2.5d;control.ToolbarPaddingRight=-3d;control.ToolbarPaddingBottom=4d;control.StatusBarEnabled=true;control.StatusBarShowToolTips=false;control.StatusBarPaddingLeft=7.5d;
        html=await Html();var toolbar=Bar(html,"toolbar");foreach(var part in new[] { "padding-left: 0px;","padding-top: 2.5px;","padding-bottom: 4px;","aria-disabled=\"true\"" })StringAssert.Contains(toolbar,part);Assert.IsFalse(toolbar.Contains("padding-right:"));var status=Bar(html,"status-bar");StringAssert.Contains(status,"padding-left: 7.5px;");StringAssert.Contains(status,"aria-disabled=\"false\"");Assert.IsFalse(status.Contains("padding-top:"));StringAssert.Contains(html,"data-toolbar-padding-right=\"-3\"");StringAssert.Contains(html,"data-status-bar-show-tooltips=\"false\"");Assert.IsFalse(html.Contains("<button"));Assert.IsFalse(html.Contains("title="));
        foreach(var width in new[] { -2d,double.NaN,double.PositiveInfinity }) { control.StatusBarPaddingRight=width;Assert.IsFalse(Bar(await Html(),"status-bar").Contains("padding-right:")); }
        control.StatusBarPaddingRight=0d;StringAssert.Contains(Bar(await Html(),"status-bar"),"padding-right: 0px;");
        control.ShowToolbar=false;control.ShowStatusBar=false;html=await Html();Assert.AreEqual("",Bar(html,"toolbar"));Assert.AreEqual("",Bar(html,"status-bar"));StringAssert.Contains(html,"data-toolbar-enabled=\"false\"");StringAssert.Contains(html,"data-status-bar-padding-left=\"7.5\"");
        Assert.AreEqual(-3d,control.ToolbarPaddingRight!.StaticValue);Assert.AreEqual(true,control.StatusBarEnabled!.StaticValue);
    }
}
