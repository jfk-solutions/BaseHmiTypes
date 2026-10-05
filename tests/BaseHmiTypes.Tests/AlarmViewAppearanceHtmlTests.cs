using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass] public class AlarmViewAppearanceHtmlTests
{
    [TestMethod] public async Task DefaultAndExplicitViewsUseIndependentLocalizedAppearance()
    {
        var control=new HmiAlarmControl{DefaultColumnSet="Primary",TableBackgroundColor=HmiColor.FromArgb(255,1,2,3),TableHeaderBackgroundColor=HmiColor.FromArgb(255,4,5,6)};var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);
        var font=new HmiFont{Name="BodyFace",Size=10};font.LocalizedFonts[1031]=new(){Name="LocalizedFace",Size=12,Italic=true};
        var primary=new HmiAlarmColumnSet{Name="Primary",BackgroundColor=HmiColor.FromArgb(0,17,34,51),ForegroundColor=HmiColor.FromArgb(255,68,85,102),HeaderBackgroundColor=HmiColor.FromArgb(255,170,187,204),HeaderForegroundColor=HmiColor.FromArgb(255,17,34,51),HeaderBorderColor=HmiColor.FromArgb(255,85,102,119),ContentFont=font,HeaderFont=new(){Name="HeadFace",Size=14,Bold=true}};
        var secondary=new HmiAlarmColumnSet{Name="Secondary <A>",BackgroundColor=HmiColor.FromArgb(255,7,8,9)};control.ColumnSets.Add(primary);control.ColumnSets.Add(secondary);primary.Columns.Add(new(){SourceType="Column"});
        static string Table(string html)=>html.Split("<table class=\"hmi-alarm-table")[1].Split("</table>")[0];
        var renderer=new HmiScreenToHtmlConverter();var options=new HmiHtmlConvertOptions{CultureLcid=1031};
        var html=await renderer.ConvertAsync(screen,options:options);var table=Table(html);foreach(var fragment in new[]{"data-default-column-set=\"Primary\"","data-column-set-name=\"Primary\"","background-color: rgba(17,34,51,0);","font-family: LocalizedFace;font-size: 12px;","font-family: HeadFace;font-size: 14px;","border-color: #556677;"})StringAssert.Contains(html,fragment);
        var heading=table.Split("<thead>")[1].Split("</thead>")[0];StringAssert.Contains(heading,"background-color: #AABBCC;");Assert.IsFalse(heading.Contains("font-family: LocalizedFace;"));StringAssert.Contains(html,"data-column-set-name=\"Secondary &lt;A&gt;\"");
        control.ActiveColumnSet=secondary.Name;table=Table(await renderer.ConvertAsync(screen,options:options));StringAssert.Contains(table,"background-color: #070809;");StringAssert.Contains(table,"background-color: #040506;");Assert.IsFalse(table.Contains("HeadFace"));Assert.IsFalse(table.Contains("LocalizedFace"));
        control.ActiveColumnSet="Unknown";table=Table(await renderer.ConvertAsync(screen,options:options));StringAssert.Contains(table,"background-color: #010203;");Assert.IsFalse(table.Contains("data-view-background-color"));
        control.ActiveColumnSet=null;control.ShowHeader=false;table=Table(await renderer.ConvertAsync(screen,options:options));Assert.IsFalse(table.Contains("<thead>"));StringAssert.Contains(table,"data-view-header-background-color=\"#AABBCC\"");StringAssert.Contains(table,"font-family: LocalizedFace;");
    }
    [TestMethod] public async Task FontNamesAreEncodedOnceInMetadataAndActualStyles()
    {
        var control=new HmiAlarmControl{DefaultColumnSet="Primary"};control.ColumnSets.Add(new(){Name="Primary",ContentFont=new(){Name="Face <&\""},HeaderFont=new(){Name="Face <&\""}});
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(control);var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html,"data-view-content-font-style=\"font-family: Face &lt;&amp;&quot;;\"");StringAssert.Contains(html,"data-view-header-font-style=\"font-family: Face &lt;&amp;&quot;;\"");Assert.IsFalse(html.Contains("Face &amp;lt;"));
    }
}
