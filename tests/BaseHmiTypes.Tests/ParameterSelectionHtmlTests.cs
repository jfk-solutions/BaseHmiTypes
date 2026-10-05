using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass]
public class ParameterSelectionHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task SelectionSampleIsOptionalAndSeparateFromContent(bool detailed)
    {
        HmiParameterControlBase control=detailed?new HmiDetailedParameterControl():new HmiOverviewParameterControl();control.Name="Control <A>";
        var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);var renderer=new HmiScreenToHtmlConverter();
        Assert.IsFalse((await renderer.ConvertAsync(screen)).Contains("hmi-parameter-selection-preview"));
        control.SelectFullRow=false;var html=await renderer.ConvertAsync(screen);StringAssert.Contains(html,"Selection appearance preview · Cell");StringAssert.Contains(html,"data-select-full-row=\"false\"");
        control.SelectFullRow=true;control.SelectionBackgroundColor=HmiColor.FromArgb(0,17,34,51);control.SelectionForegroundColor=HmiColor.FromArgb(255,68,85,102);control.SelectionBorderColor=HmiColor.FromArgb(255,119,136,153);control.SelectionBorderWidth=0d;
        control.ContentBackgroundColor=HmiColor.FromArgb(255,1,2,3);control.ContentFont=new() { Name="Content",Size=13 };control.ContentFont.LocalizedFonts[1031]=new() { Name="Localized <A> & B",Size=17 };
        control.ColumnDefinitions.Add(new() { Name="Column <A>" });
        html=await renderer.ConvertAsync(screen,options:new() { CultureLcid=1031 });var sample=Regex.Match(html,"<div class=\"hmi-parameter-selection-preview\"[^>]*>").Value;
        foreach(var part in new[] { "background-color: rgba(17,34,51,0);","color: #445566;","border-color: #778899;","border-width: 0px;","font-family: Localized &lt;A&gt; &amp; B;font-size: 17px;" }) StringAssert.Contains(sample,part);
        Assert.IsFalse(sample.Contains("#010203"));StringAssert.Contains(html,"Selection appearance preview · Entire row");StringAssert.Contains(html,"Parameter data not loaded");StringAssert.Contains(html,"Column &lt;A&gt;");
        var fallback=Regex.Match(await renderer.ConvertAsync(screen,options:new() { CultureLcid=1036 }),"<div class=\"hmi-parameter-selection-preview\"[^>]*>").Value;StringAssert.Contains(fallback,"font-family: Content;font-size: 13px;");
        foreach(var width in new[] { -2d,double.NaN,double.PositiveInfinity }) { control.SelectionBorderWidth=width;sample=Regex.Match(await renderer.ConvertAsync(screen),"<div class=\"hmi-parameter-selection-preview\"[^>]*>").Value;Assert.IsFalse(sample.Contains("border-width:"));Assert.IsFalse(sample.Contains("border-style:")); }
        control.SelectionBorderWidth=2.5d;sample=Regex.Match(await renderer.ConvertAsync(screen),"<div class=\"hmi-parameter-selection-preview\"[^>]*>").Value;StringAssert.Contains(sample,"border-width: 2.5px;");
        if(control is HmiDetailedParameterControl detail) { detail.HideDetails=true;html=await renderer.ConvertAsync(screen);Assert.IsFalse(html.Contains("hmi-parameter-selection-preview"));StringAssert.Contains(html,"data-selection-border-width=\"2.5\"");Assert.AreEqual(1,control.ColumnDefinitions.Count); }
        Assert.AreEqual(2.5d,control.SelectionBorderWidth!.StaticValue);Assert.AreEqual(HmiColor.FromArgb(0,17,34,51),control.SelectionBackgroundColor!.StaticValue);
    }
}
