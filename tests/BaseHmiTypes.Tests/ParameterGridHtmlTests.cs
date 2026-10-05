using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass]
public class ParameterGridHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task GridAndScrollModesKeepHeadersAndPermissionsIndependent(bool detailed)
    {
        HmiParameterControlBase control=detailed?new HmiDetailedParameterControl():new HmiOverviewParameterControl();control.Width=600;control.Height=200;
        control.GridLineWidth=2.5d;control.GridLineColor=HmiColor.FromArgb(255,17,34,51);control.HeaderBorderColor=HmiColor.FromArgb(255,68,85,102);
        control.ColumnDefinitions.Add(new() { Name="Column <A>",AllowSort=true });control.ColumnDefinitions.Add(new() { Name="Column <B>",AllowSort=false });
        var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);var renderer=new HmiScreenToHtmlConverter();
        async Task<string> Html()=>HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(screen));
        string Details(string html)=>Regex.Match(html,"<div class=\"hmi-parameter-details\"[^>]*>").Value;
        var html=await Html();StringAssert.Contains(Details(html),"border-top-width: 2.5px;");Assert.IsFalse(html.Contains("data-grid-line-visibility="));Assert.IsFalse(html.Contains("data-allow-sort-by-column="));
        control.AllowSortByColumn=false;control.AllowFilterByColumn=true;
        foreach(var mode in new[] { 0,1,2,3,37,int.MinValue,int.MaxValue }) {
            control.GridLineVisibility=mode;control.GridSelectionMode=mode;control.ColoringMode=mode;html=await Html();StringAssert.Contains(Details(html),"border-top-width: "+(mode==2?"2.5":"0")+"px;");
            foreach(var key in new[] { "grid-line-visibility","grid-selection-mode","coloring-mode" })StringAssert.Contains(html,"data-"+key+"=\""+mode+"\"");
            StringAssert.Contains(html,"border-right-color: #445566;");StringAssert.Contains(html,"border-right-width: 2.5px;");StringAssert.Contains(html,"data-allow-sort-by-column=\"false\"");StringAssert.Contains(html,"data-allow-filter-by-column=\"true\"");StringAssert.Contains(html,"data-allow-sort=\"true\"");StringAssert.Contains(html,"Column &lt;A&gt;");StringAssert.Contains(html,"Parameter data not loaded");Assert.AreEqual(2,Regex.Matches(html,"<tr>").Count);Assert.IsFalse(html.Contains("<button"));
        }
        foreach(var pair in new[] { (X:0,Y:1),(X:1,Y:2),(X:2,Y:0) }) { control.HorizontalScrollBarVisibility=pair.X;control.VerticalScrollBarVisibility=pair.Y;html=await Html();string Overflow(int mode)=>mode==0?"auto":mode==1?"scroll":"hidden";StringAssert.Contains(Details(html),"overflow-x: "+Overflow(pair.X)+";");StringAssert.Contains(Details(html),"overflow-y: "+Overflow(pair.Y)+";"); }
        control.HorizontalScrollBarVisibility=37;control.VerticalScrollBarVisibility=int.MinValue;html=await Html();Assert.IsFalse(Details(html).Contains("overflow-x:"));Assert.IsFalse(Details(html).Contains("overflow-y:"));StringAssert.Contains(html,"data-horizontal-scroll-bar-visibility=\"37\"");StringAssert.Contains(html,"data-vertical-scroll-bar-visibility=\"-2147483648\"");
        if(control is HmiDetailedParameterControl detail) { detail.HideDetails=true;html=await Html();Assert.IsFalse(html.Contains("class=\"hmi-parameter-details\""));StringAssert.Contains(html,"data-grid-selection-mode=\"2147483647\"");StringAssert.Contains(html,"data-allow-sort-by-column=\"false\""); }
        Assert.AreEqual(2,control.ColumnDefinitions.Count);Assert.AreEqual(true,control.ColumnDefinitions[0].AllowSort!.StaticValue);Assert.AreEqual(37,control.HorizontalScrollBarVisibility!.StaticValue);
    }
}
