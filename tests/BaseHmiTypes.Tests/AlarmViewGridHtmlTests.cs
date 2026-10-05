using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass] public class AlarmViewGridHtmlTests
{
    [TestMethod] public async Task GridDimensionsStayOptionalAndUnknownModesUseLegacyPreviewFlags()
    {
        var control=new HmiAlarmControl{DefaultColumnSet="Primary",ShowHorizontalGridLines=false,ShowVerticalGridLines=true,GridLineWidth=2.5,CellPaddingLeft=19,CellPaddingRight=99};
        var set=new HmiAlarmColumnSet{Name="Primary",GridLineColor=HmiColor.FromArgb(0,17,34,51),GridLineWidth=0,GridLineVisibility=2,CellPaddingLeft=0,CellPaddingTop=7,CellPaddingRight=-7,RowHeight=0};control.ColumnSets.Add(set);set.Columns.Add(new(){SourceType="Column"});
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(control);var renderer=new HmiScreenToHtmlConverter();
        static string Table(string html)=>html.Split("<table class=\"hmi-alarm-table")[1].Split("</table>")[0];
        static string Body(string html)=>Table(html).Split("<tbody>")[1];
        var html=await renderer.ConvertAsync(screen);var body=Body(html);foreach(var fragment in new[]{"border-width: 0px 0px;","border-color: rgba(17,34,51,0);","padding-left: 0px;","padding-top: 7px;","height: auto;"})StringAssert.Contains(body,fragment);Assert.IsFalse(body.Contains("padding-right: -7px"));Assert.IsFalse(body.Contains("padding-right: 99px"));StringAssert.Contains(html,"data-view-cell-padding-right=\"-7\"");
        set.GridLineVisibility=3;set.GridLineWidth=null;set.RowHeight=12.5;body=Body(await renderer.ConvertAsync(screen));StringAssert.Contains(body,"border-width: 0px 2.5px;");StringAssert.Contains(body,"height: 12.5px;");
        foreach(var invalid in new[]{double.NaN,double.PositiveInfinity,-1d}){set.GridLineWidth=invalid;set.RowHeight=invalid;set.CellPaddingTop=invalid;body=Body(await renderer.ConvertAsync(screen));StringAssert.Contains(body,"border-width: 0px 2.5px;");Assert.IsFalse(body.Contains("height:"));Assert.IsFalse(body.Contains("padding-top:"));}
        set.GridLineWidth=4;set.RowHeight=null;set.CellPaddingLeft=null;set.GridLineVisibility=1;control.ShowHeader=false;html=await renderer.ConvertAsync(screen);body=Body(html);StringAssert.Contains(body,"border-width: 0px 4px;");StringAssert.Contains(body,"padding-left: 19px;");Assert.IsFalse(Table(html).Contains("<thead>"));StringAssert.Contains(html,"data-view-grid-line-visibility=\"1\"");
        set.Columns.Clear();set.GridLineVisibility=0;body=Body(await renderer.ConvertAsync(screen));StringAssert.Contains(body,"border-width: 0px 0px;");StringAssert.Contains(body,"Alarm data not loaded");
        control.ActiveColumnSet="Unknown";body=Body(await renderer.ConvertAsync(screen));StringAssert.Contains(body,"border-width: 0px 2.5px;");Assert.IsFalse(body.Contains("rgba(17,34,51,0)"));
    }
}
