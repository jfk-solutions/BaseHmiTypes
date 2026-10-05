using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass]
public class ParameterHeaderHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task HeaderSelectionSampleAndConfigurationAreIndependent(bool detailed)
    {
        HmiParameterControlBase control=detailed?new HmiDetailedParameterControl():new HmiOverviewParameterControl();control.Name="Header <A>";
        var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);var renderer=new HmiScreenToHtmlConverter();
        async Task<string> Html()=>HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(screen));
        Assert.IsFalse((await Html()).Contains("hmi-parameter-header-selection-preview"));Assert.IsFalse((await Html()).Contains("data-column-header-type"));
        control.AllowColumnReorder=false;control.AllowColumnResize=true;control.ColumnHeaderType=0;control.RowHeaderType=int.MinValue;
        control.HeaderSelectionForegroundColor=HmiColor.FromArgb(255,68,85,102);var html=await Html();var sample=Regex.Match(html,"<div class=\"hmi-parameter-header-selection-preview\"[^>]*>").Value;StringAssert.Contains(sample,"color: #445566;");Assert.IsFalse(sample.Contains("background-color:"));StringAssert.Contains(html,"data-allow-column-reorder=\"false\"");StringAssert.Contains(html,"data-allow-column-resize=\"true\"");StringAssert.Contains(html,"data-column-header-type=\"0\"");StringAssert.Contains(html,"data-row-header-type=\"-2147483648\"");
        control.ColumnHeaderType=2;control.HeaderSelectionBackgroundColor=HmiColor.FromArgb(0,17,34,51);control.HeaderBackgroundColor=HmiColor.FromArgb(255,1,2,3);control.SelectionBackgroundColor=HmiColor.FromArgb(255,119,136,153);control.HeaderFont=new() { Name="Header",Size=13 };control.HeaderFont.LocalizedFonts[1031]=new() { Name="Localized <A> & B",Size=17 };control.ColumnDefinitions.Add(new() { Name="Column <A>" });
        var options=new HmiHtmlConvertOptions { CultureLcid=1031 };html=HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(screen,options:options));sample=Regex.Match(html,"<div class=\"hmi-parameter-header-selection-preview\"[^>]*>").Value;
        foreach(var part in new[] { "background-color: rgba(17,34,51,0);","color: #445566;","font-family: Localized &lt;A&gt; &amp; B;font-size: 17px;" })StringAssert.Contains(sample,part);Assert.IsFalse(sample.Contains("#010203"));Assert.IsFalse(sample.Contains("#778899"));StringAssert.Contains(html,"Column &lt;A&gt;");StringAssert.Contains(html,"Parameter data not loaded");StringAssert.Contains(html,"Header selection appearance preview");Assert.AreEqual(2,Regex.Matches(html,"<tr[ >]").Count);Assert.IsFalse(html.Contains("<button"));
        options.CultureLcid=1036;sample=Regex.Match(HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(screen,options:options)),"<div class=\"hmi-parameter-header-selection-preview\"[^>]*>").Value;StringAssert.Contains(sample,"font-family: Header;font-size: 13px;");
        control.HeaderSelectionForegroundColor=null;sample=Regex.Match(await Html(),"<div class=\"hmi-parameter-header-selection-preview\"[^>]*>").Value;Assert.IsFalse(sample.Contains("color: #"));StringAssert.Contains(sample,"background-color: rgba(17,34,51,0);");
        if(control is HmiDetailedParameterControl detail) { detail.HideDetails=true;html=await Html();Assert.IsFalse(html.Contains("class=\"hmi-parameter-header-selection-preview\""));StringAssert.Contains(html,"data-row-header-type=\"-2147483648\"");StringAssert.Contains(html,"data-header-selection-background-color");Assert.AreEqual(1,control.ColumnDefinitions.Count); }
    }
}
