using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass]
public class AlarmMessageBlockHtmlTests
{
    [TestMethod]
    public async Task DefinitionsRemainOrderedOptionalAndSeparateFromRuntimeRows()
    {
        var control=new HmiAlarmControl();var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);var renderer=new HmiScreenToHtmlConverter();
        Assert.IsFalse((await renderer.ConvertAsync(screen)).Contains("hmi-alarm-message-blocks"));
        control.MessageBlocks.Add(new() {Name="Repeated <A>",DecimalPlaces=0,LeadingZeros=0,ShowDate=false,DateFormat="<format>"});control.MessageBlocks.Add(new());control.MessageBlocks.Add(new() {Name="Repeated <A>",LeadingZeros=-7,TimeFormat="<time>"});control.MessageBlocks.Add(new() {Name=""});
        var html=await renderer.ConvertAsync(screen);StringAssert.Contains(html,"data-message-block-count=\"4\"");StringAssert.Contains(html,"data-message-block-name=\"\"");StringAssert.Contains(html,"data-decimal-places=\"0\"");StringAssert.Contains(html,"data-show-date=\"false\"");StringAssert.Contains(html,"data-leading-zeros=\"-7\"");StringAssert.Contains(html,"&lt;format&gt;");StringAssert.Contains(html,"&lt;time&gt;");Assert.AreEqual(0,control.ColumnDefinitions.Count);
    }
}
