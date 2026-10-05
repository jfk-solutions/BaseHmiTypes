using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass] public class AlarmViewSelectionAppearanceHtmlTests
{
    [TestMethod] public async Task AppearanceRoutesPerViewWithoutSelectingThePlaceholder()
    {
        var control=new HmiAlarmControl{DefaultColumnSet="Primary",AlternatingRowBackgroundColor=HmiColor.FromArgb(255,1,2,3),AlternatingRowForegroundColor=HmiColor.FromArgb(255,4,5,6)};
        var primary=new HmiAlarmColumnSet{Name="Primary",AlternateBackgroundColor=HmiColor.FromArgb(0,17,34,51),SelectionBackgroundColor=HmiColor.FromArgb(255,119,136,153),SelectionForegroundColor=HmiColor.FromArgb(255,170,187,204),SelectionBorderColor=HmiColor.FromArgb(255,221,238,255),SelectionBorderWidth=0,HeaderSelectionBackgroundColor=HmiColor.FromArgb(0,17,34,51),HeaderSelectionForegroundColor=HmiColor.FromArgb(255,68,85,102)};
        var stats=new HmiAlarmColumnSet{Name="Statistics",SelectionBorderWidth=255};control.ColumnSets.Add(primary);control.ColumnSets.Add(stats);
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(control);var renderer=new HmiScreenToHtmlConverter();
        static string Table(string html)=>html.Split("<table class=\"hmi-alarm-table")[1].Split("</table>")[0];
        var html=await renderer.ConvertAsync(screen);var table=Table(html);StringAssert.Contains(table,"--hmi-alarm-alternating-row-background: rgba(17,34,51,0);");StringAssert.Contains(table,"--hmi-alarm-alternating-row-foreground: #040506;");StringAssert.Contains(table,"data-view-selection-border-width=\"0\"");StringAssert.Contains(table,"data-view-header-selection-foreground-color=\"#445566\"");Assert.IsFalse(table.Split("<tbody>")[1].Contains("#778899"));Assert.IsFalse(table.Contains("hmi-alarm-table--alternating"));
        control.UseAlternatingRowColors=true;table=Table(await renderer.ConvertAsync(screen));StringAssert.Contains(table,"hmi-alarm-table--alternating");
        control.ActiveColumnSet="Statistics";html=await renderer.ConvertAsync(screen);table=Table(html);StringAssert.Contains(table,"data-view-selection-border-width=\"255\"");StringAssert.Contains(table,"--hmi-alarm-alternating-row-background: #010203;");Assert.IsFalse(table.Contains("data-view-selection-background-color"));StringAssert.Contains(html,"data-view-selection-background-color=\"#778899\"");
        control.ActiveColumnSet="Unknown";table=Table(await renderer.ConvertAsync(screen));Assert.IsFalse(table.Contains("data-view-selection"));StringAssert.Contains(table,"--hmi-alarm-alternating-row-background: #010203;");
        control.ActiveColumnSet="Primary";primary.AlternateBackgroundColor=null;control.AlternatingRowBackgroundColor=null;table=Table(await renderer.ConvertAsync(screen));Assert.IsFalse(table.Contains("--hmi-alarm-alternating-row-background:"));StringAssert.Contains(table,"data-view-header-selection-background-color=\"rgba(17,34,51,0)\"");StringAssert.Contains(table,"Alarm data not loaded");
    }
}
