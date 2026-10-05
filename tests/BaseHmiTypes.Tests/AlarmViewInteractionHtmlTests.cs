using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass] public class AlarmViewInteractionHtmlTests
{
    [TestMethod] public async Task ViewSelectionRoutesScrollModesAndRetainsSelectionMetadata()
    {
        var control=new HmiAlarmControl{DefaultColumnSet="Primary",ShowHorizontalScrollbar=true,ShowVerticalScrollbar=false};
        var primary=new HmiAlarmColumnSet{Name="Primary",HorizontalScrollBarVisibility=0,VerticalScrollBarVisibility=1,GridSelectionMode=0,SelectFullRow=false};
        var stats=new HmiAlarmColumnSet{Name="Statistics",HorizontalScrollBarVisibility=2,VerticalScrollBarVisibility=2,GridSelectionMode=2,SelectFullRow=true};control.ColumnSets.Add(primary);control.ColumnSets.Add(stats);primary.Columns.Add(new(){SourceType="Column"});
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(control);var renderer=new HmiScreenToHtmlConverter();
        static string Table(string html)=>html.Split("<table class=\"hmi-alarm-table")[1].Split("</table>")[0];
        var html=await renderer.ConvertAsync(screen);StringAssert.Contains(html,"overflow-x: auto;overflow-y: scroll;");StringAssert.Contains(Table(html),"data-view-select-full-row=\"false\"");StringAssert.Contains(Table(html),"data-view-grid-selection-mode=\"0\"");StringAssert.Contains(html,"<template class=\"hmi-alarm-view-settings\">");StringAssert.Contains(html,"data-column-set-name=\"Statistics\"");
        control.ActiveColumnSet="Statistics";html=await renderer.ConvertAsync(screen);StringAssert.Contains(html,"overflow-x: hidden;overflow-y: hidden;");StringAssert.Contains(Table(html),"data-view-select-full-row=\"true\"");StringAssert.Contains(Table(html),"data-view-grid-selection-mode=\"2\"");
        control.ActiveColumnSet="Primary";primary.HorizontalScrollBarVisibility=3;primary.VerticalScrollBarVisibility=-1;primary.GridSelectionMode=37;control.ShowHeader=false;
        html=await renderer.ConvertAsync(screen);StringAssert.Contains(html,"overflow-x: auto;overflow-y: hidden;");StringAssert.Contains(Table(html),"data-view-grid-selection-mode=\"37\"");Assert.IsFalse(Table(html).Contains("<thead>"));
        primary.HorizontalScrollBarVisibility=null;primary.VerticalScrollBarVisibility=null;primary.GridSelectionMode=null;primary.SelectFullRow=null;html=await renderer.ConvertAsync(screen);Assert.IsFalse(Table(html).Contains("data-view-select-full-row"));Assert.IsFalse(Table(html).Contains("data-view-grid-selection-mode"));Assert.IsFalse(html.Split("<template class=\"hmi-alarm-view-settings\">")[1].Split("</template>")[0].Contains("data-column-set-name=\"Primary\""));StringAssert.Contains(html,"overflow-x: auto;overflow-y: hidden;");
        control.ActiveColumnSet="Unknown";html=await renderer.ConvertAsync(screen);StringAssert.Contains(html,"overflow-x: auto;overflow-y: hidden;");Assert.IsFalse(Table(html).Contains("data-view-"));
        control.ActiveColumnSet="Statistics";stats.HorizontalScrollBarVisibility=null;stats.VerticalScrollBarVisibility=null;stats.SelectFullRow=null;html=await renderer.ConvertAsync(screen);StringAssert.Contains(html,"data-column-set-name=\"Statistics\"");StringAssert.Contains(Table(html),"data-view-grid-selection-mode=\"2\"");StringAssert.Contains(Table(html),"Alarm data not loaded");
    }
}
