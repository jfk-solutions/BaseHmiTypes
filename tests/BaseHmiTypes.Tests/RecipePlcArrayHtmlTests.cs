using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Recipes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class RecipePlcArrayHtmlTests
{
    [TestMethod]
    public void ArrayMetadataKeepsMissingEmptyAndIndependentBoundLists()
    {
        var recipe = new HmiRecipe(); var field = new HmiRecipeParameter { Name = "Field <A>" }; recipe.Parameters.Add(field);
        var renderer = new HmiRecipeToHtmlConverter(); Assert.IsFalse(renderer.Convert(recipe).Contains("<h2>Source PLC array declarations</h2>"));
        field.SourcePlcArray = new() { OriginalTypeName = "Array[*] of <Type>", ElementTypeName = "", IsStarArray = true };
        var html = renderer.Convert(recipe);
        StringAssert.Contains(html,"Array[*] of &lt;Type&gt;"); StringAssert.Contains(html,"<td data-value-state=\"present\"></td><td data-value-state=\"present\">Yes</td><td data-value-state=\"missing\">Missing</td><td data-value-state=\"missing\">Missing</td>");
        Assert.IsFalse(html.Contains("<h2>Source PLC array bounds</h2>"));
        field.SourcePlcArray.Dimensions = []; field.SourcePlcArray.ResolvedDimensions = [];
        html = renderer.Convert(recipe); StringAssert.Contains(html,"<td data-value-state=\"present\">Yes</td><td data-value-state=\"present\">0</td><td data-value-state=\"present\">0</td>");
        recipe.SourcePlcDeclarations.Add(new() { Name = "Parent <B>", Array = new() { IsStarArray = false,
            Dimensions = [new() { Start = "Symbol <A> & B", End = "" }, new() { End = "Upper" }],
            ResolvedDimensions = [new() { Start = int.MinValue, End = int.MaxValue }] } });
        html = renderer.Convert(recipe); StringAssert.Contains(html,"<h2>Source PLC array bounds</h2>");
        StringAssert.Contains(html,"Symbol &lt;A&gt; &amp; B"); StringAssert.Contains(html,"Parent &lt;B&gt;");
        StringAssert.Contains(html,"<td data-value-state=\"present\">Declared</td><td data-value-state=\"present\">2</td><td data-value-state=\"missing\">Missing</td><td data-value-state=\"present\">Upper</td>");
        StringAssert.Contains(html,"<td data-value-state=\"present\">Resolved</td><td data-value-state=\"present\">1</td><td data-value-state=\"present\">-2147483648</td><td data-value-state=\"present\">2147483647</td>");
        Assert.AreEqual(0, recipe.DataSets.Count); Assert.IsNull(field.DefaultValue);
    }
}
