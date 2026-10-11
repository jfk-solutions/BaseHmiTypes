using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class RecipeColumnMetadataHtmlTests
{
    [TestMethod] [DataRow("")] [DataRow("Width <&>")]
    public async Task WidthExpressionsAndInvalidFallbacksRemainMetadata(string expression)
    {
        var control=new HmiRecipeControl { ViewKind=HmiRecipeViewKind.Table };control.ColumnDefinitions.Add(new(){Width=HmiProperty.Expression(expression,double.NaN)});
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(control);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var row=Regex.Match(html,"<div hidden data-recipe-column-definition[^>]*>").Value;
        StringAssert.Contains(row,expression.Length==0?"data-column-width=\"NaN\"":"data-column-width=\"Width &lt;&amp;&gt;\"");
        Assert.IsTrue(double.IsNaN(control.ColumnDefinitions[0].Width!.StaticValue));
        var table=html.Split("<table")[1].Split("</table>")[0];Assert.IsFalse(table.Contains("width: NaNpx"));
    }

    [TestMethod] [DataRow(HmiRecipeViewKind.Table,true)] [DataRow(HmiRecipeViewKind.Table,false)]
    [DataRow(HmiRecipeViewKind.Selector,true)] [DataRow(HmiRecipeViewKind.Selector,false)]
    public async Task AllConfiguredColumnsRemainOrderedAndIndependentOfVisibleLayout(HmiRecipeViewKind kind,bool headings)
    {
        var control=new HmiRecipeControl { Name="RecipeColumns",ViewKind=kind,ShowHeader=headings };
        var label=HmiMultilingualText.FromText("English",1033); label.Texts[1031]="Feld <&>";
        control.ColumnDefinitions.Add(new(){Type=HmiRecipeColumnType.Unknown,SourceType="Raw <&>\"",Width=HmiProperty.Tag("Recipe.Width",0d),HeaderText=label});
        control.ColumnDefinitions.Add(new(){Type=HmiRecipeColumnType.Unknown,SourceType="Raw <&>\"",Visible=false,Width=-4,HeaderText=HmiMultilingualText.FromText("Hidden column")});
        control.ColumnDefinitions.Add(new(){Type=HmiRecipeColumnType.Unit,SourceType="",Visible=true,Width=double.NaN,HeaderText=HmiMultilingualText.FromText("")});
        control.ColumnDefinitions.Add(new(){Type=HmiRecipeColumnType.TagName,SourceType=" "});
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(control);var renderer=new HmiScreenToHtmlConverter();
        async Task<string> Convert()=>Regex.Replace(await renderer.ConvertAsync(screen,null,new(){CultureLcid=1031}),"<script\\b[^>]*>.*?</script>","",RegexOptions.Singleline);
        var html=await Convert();var rows=Regex.Matches(html,"<div hidden data-recipe-column-definition[^>]*>").Select(m=>m.Value).ToArray();Assert.AreEqual(4,rows.Length);
        for(var i=0;i<rows.Length;i++)StringAssert.Contains(rows[i],$"data-column-index=\"{i}\"");
        StringAssert.Contains(rows[0],"data-source-type=\"Raw &lt;&amp;&gt;&quot;\"");StringAssert.Contains(rows[0],"data-column-width=\"0\"");StringAssert.Contains(rows[0],"data-header-text=\"Feld &lt;&amp;&gt;\"");Assert.IsFalse(rows[0].Contains("data-column-visible="));
        StringAssert.Contains(rows[1],"data-column-visible=\"false\"");StringAssert.Contains(rows[1],"data-column-width=\"-4\"");StringAssert.Contains(rows[1],"data-header-text=\"Hidden column\"");
        StringAssert.Contains(rows[2],"data-source-type=\"\"");StringAssert.Contains(rows[2],"data-header-text=\"\"");StringAssert.Contains(rows[2],"data-column-visible=\"true\"");StringAssert.Contains(rows[2],"data-column-width=\"NaN\"");
        StringAssert.Contains(rows[3],"data-source-type=\" \"");Assert.IsFalse(rows[3].Contains("data-column-width="));Assert.IsFalse(rows[3].Contains("data-header-text="));
        if(kind==HmiRecipeViewKind.Table) { var table=html.Split("<table")[1].Split("</table>")[0];Assert.AreEqual(3,Regex.Matches(table,"<col\\b").Count);Assert.AreEqual(headings,table.Contains("<thead>"));Assert.IsFalse(table.Contains("Hidden column"));StringAssert.Contains(table,"Recipe data not loaded"); }
        else Assert.IsFalse(html.Contains("<table"));
        Assert.AreEqual(4,control.ColumnDefinitions.Count);Assert.AreEqual(-4d,control.ColumnDefinitions[1].Width!.StaticValue);Assert.AreEqual("Raw <&>\"",control.ColumnDefinitions[0].SourceType);Assert.AreEqual("Recipe.Width",((HmiTagProperty<double>)control.ColumnDefinitions[0].Width!).TagName);
        control.ColumnDefinitions.Clear();html=await Convert();Assert.IsFalse(html.Contains("data-recipe-column-definition"));
    }
}
