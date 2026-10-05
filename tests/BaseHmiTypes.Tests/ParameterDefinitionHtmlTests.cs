using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Recipes;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass]
public class ParameterDefinitionHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task ConfiguredFieldsAreEncodedWithoutBecomingRuntimeRecords(bool overview)
    {
        HmiParameterControlBase control = overview ? new HmiOverviewParameterControl() : new HmiDetailedParameterControl();
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(control); screen.Layers.Add(layer);
        var renderer = new HmiScreenToHtmlConverter();
        var empty = await renderer.ConvertAsync(screen); Assert.IsFalse(empty.Contains("hmi-parameter-definition-preview"));
        control.DefaultParameterSetTypeReferenceKey = "";
        control.DefaultParameterSetTypeReference = new() { SourceId="17-23",Name="Type <A>" };
        control.DefaultParameterSetType = new() { Name="Type <A>" };
        control.DefaultParameterSetType.Parameters.Add(new() { Name="Field <A>",DataType="Type & B",DefaultValue="<script>example</script>" });
        var html = await renderer.ConvertAsync(screen);
        StringAssert.Contains(html,"data-default-parameter-set-type-reference-key=\"\""); StringAssert.Contains(html,"data-default-parameter-set-type-field-count=\"1\"");
        StringAssert.Contains(html,"Configured parameter set type: Type &lt;A&gt;"); StringAssert.Contains(html,"Field &lt;A&gt;"); StringAssert.Contains(html,"Type &amp; B"); StringAssert.Contains(html,"&lt;script&gt;example&lt;/script&gt;"); StringAssert.Contains(html,"Parameter data not loaded"); Assert.AreEqual(0,control.DefaultParameterSetType.DataSets.Count);
        if (control is HmiDetailedParameterControl detailed) { detailed.HideDetails=true; html=await renderer.ConvertAsync(screen); Assert.IsFalse(html.Contains("hmi-parameter-definition-preview")); StringAssert.Contains(html,"data-default-parameter-set-type-field-count=\"1\""); }
    }
}
