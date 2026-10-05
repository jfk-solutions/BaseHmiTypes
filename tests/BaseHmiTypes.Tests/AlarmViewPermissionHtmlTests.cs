using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass] public class AlarmViewPermissionHtmlTests
{
    [TestMethod] public async Task ViewPermissionsRemainIndependentAndOnlyExplicitSelectionMarksTheTable()
    {
        var control=new HmiAlarmControl();var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);var renderer=new HmiScreenToHtmlConverter();
        var first=new HmiAlarmColumnSet{Name="View <A>",AllowSort=false,AllowFilter=true,AllowColumnReorder=false,AllowColumnResize=true};
        var second=new HmiAlarmColumnSet{Name="",AllowSort=true,AllowFilter=false};control.ColumnSets.Add(first);control.ColumnSets.Add(second);control.ColumnSets.Add(new(){Name="Unset"});
        static string Table(string html)=>html.Split("<table class=\"hmi-alarm-table")[1].Split("</table>")[0];
        var html=await renderer.ConvertAsync(screen);var settings=html.Split("<template class=\"hmi-alarm-view-settings\">")[1].Split("</template>")[0];
        StringAssert.Contains(settings,"data-column-set-name=\"View &lt;A&gt;\" data-view-allow-sort=\"false\" data-view-allow-filter=\"true\" data-view-allow-column-reorder=\"false\" data-view-allow-column-resize=\"true\"");StringAssert.Contains(settings,"data-column-set-name=\"\" data-view-allow-sort=\"true\" data-view-allow-filter=\"false\"");Assert.IsFalse(settings.Contains("Unset"));Assert.IsFalse(Table(html).Contains("data-view-allow-sort"));
        control.ShowHeader=false;control.ActiveColumnSet=first.Name;var table=Table(await renderer.ConvertAsync(screen));StringAssert.Contains(table,"data-view-allow-sort=\"false\"");StringAssert.Contains(table,"data-view-allow-column-resize=\"true\"");StringAssert.Contains(table,"Alarm data not loaded");
        control.ActiveColumnSet="";table=Table(await renderer.ConvertAsync(screen));StringAssert.Contains(table,"data-view-allow-sort=\"true\"");Assert.IsFalse(table.Contains("data-view-allow-column-resize"));
        control.ActiveColumnSet="Missing";Assert.IsFalse(Table(await renderer.ConvertAsync(screen)).Contains("data-view-allow-sort"));
        control.ColumnSets.Clear();Assert.IsFalse((await renderer.ConvertAsync(screen)).Contains("hmi-alarm-view-settings"));
    }
}
