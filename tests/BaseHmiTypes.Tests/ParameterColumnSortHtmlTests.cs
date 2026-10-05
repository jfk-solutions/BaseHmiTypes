using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass]
public class ParameterColumnSortHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task SortMetadataDoesNotChangeDefinitionOrder(bool overview)
    {
        HmiParameterControlBase control=overview?new HmiOverviewParameterControl():new HmiDetailedParameterControl();var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);var renderer=new HmiScreenToHtmlConverter();
        control.ColumnDefinitions.Add(new() {Name="A"});control.ColumnDefinitions.Add(new() {Name="B"});Assert.IsFalse((await renderer.ConvertAsync(screen)).Contains("data-sort-order"));
        control.ColumnDefinitions[0].SortOrder=0;control.ColumnDefinitions[0].SortDirection=int.MinValue;control.ColumnDefinitions[0].AllowSort=false;control.ColumnDefinitions[1].SortOrder=-7;control.ColumnDefinitions[1].SortDirection=37;control.ColumnDefinitions.Add(new() {Name="Hidden",Visible=false,SortOrder=1,SortDirection=0});
        var html=await renderer.ConvertAsync(screen);foreach(var fragment in new[] {"data-sort-order=\"0\"","data-sort-direction=\"-2147483648\"","data-sort-order=\"-7\"","data-sort-direction=\"37\"","Parameter data not loaded"})StringAssert.Contains(html,fragment);
        Assert.IsTrue(html.IndexOf("data-column-name=\"A\"",StringComparison.Ordinal)<html.IndexOf("data-column-name=\"B\"",StringComparison.Ordinal));Assert.IsFalse(html.Contains("data-column-name=\"Hidden\""));
    }
}
