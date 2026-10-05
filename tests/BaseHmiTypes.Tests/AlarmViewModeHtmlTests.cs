using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass] public class AlarmViewModeHtmlTests
{
    [TestMethod] public async Task KnownModesOverrideLegacyFlagsAndUnknownSelectionsKeepFallback()
    {
        var control=new HmiAlarmControl{DefaultColumnSet="Primary",UseAlternatingRowColors=true};var set=new HmiAlarmColumnSet{Name="Primary",ColoringMode=0,ColumnHeaderType=0,RowHeaderType=1};control.ColumnSets.Add(set);set.Columns.Add(new(){SourceType="Caption"});
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(control);var renderer=new HmiScreenToHtmlConverter();
        static string Table(string html)=>html.Split("<table class=\"hmi-alarm-table")[1].Split("</table>")[0];
        var table=Table(await renderer.ConvertAsync(screen));Assert.IsTrue(table.StartsWith("\""));Assert.IsFalse(table.Contains("<thead>"));StringAssert.Contains(table,"data-view-row-header-type=\"1\"");
        set.ColoringMode=1;set.ColumnHeaderType=1;table=Table(await renderer.ConvertAsync(screen));Assert.IsTrue(table.StartsWith(" hmi-alarm-table--alternating-columns\""));StringAssert.Contains(table,">1</th>");StringAssert.Contains(table,"colspan=\"1\"");StringAssert.Contains(table,"Alarm data not loaded");
        set.ColoringMode=37;set.ColumnHeaderType=37;table=Table(await renderer.ConvertAsync(screen));Assert.IsTrue(table.StartsWith(" hmi-alarm-table--alternating\""));StringAssert.Contains(table,">Caption</th>");
        control.ActiveColumnSet="Unknown";table=Table(await renderer.ConvertAsync(screen));Assert.IsFalse(table.Contains("data-view-coloring-mode"));Assert.IsTrue(table.StartsWith(" hmi-alarm-table--alternating\""));
        control.ActiveColumnSet="Primary";set.Columns.Clear();set.ColoringMode=2;set.ColumnHeaderType=0;table=Table(await renderer.ConvertAsync(screen));Assert.IsFalse(table.Contains("<thead>"));StringAssert.Contains(table,"Alarm data not loaded");
        set.ColoringMode=null;set.ColumnHeaderType=null;control.UseAlternatingRowColors=false;table=Table(await renderer.ConvertAsync(screen));Assert.IsTrue(table.StartsWith("\""));Assert.IsFalse(table.Contains("data-view-coloring-mode"));
    }
}
