using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Recipes;
using BaseHmiTypes.TextGraphicLists;

namespace BaseHmiTypes.Tests;
[TestClass]
public class RecipeTextListHtmlTests
{
    [TestMethod]
    public void MissingAndEmptyListsRemainDistinct()
    {
        var recipe = new HmiRecipe();
        var field = new HmiRecipeParameter { Name = "Field" };
        field.References["TextList"] = new() { SourceId = "17-6" };
        recipe.Parameters.Add(field);
        var renderer = new HmiRecipeToHtmlConverter();
        Assert.IsFalse(renderer.Convert(recipe).Contains("<h2>Field text lists</h2>"));
        field.TextList = new() { Name = "Empty" };
        var html = renderer.Convert(recipe);
        StringAssert.Contains(html, "<h2>Field text lists</h2>");
        StringAssert.Contains(html, "<td data-value-state=\"present\">0</td></tr>");
        Assert.IsFalse(html.Contains("<h2>Field text-list entries</h2>"));
    }

    [TestMethod]
    public void EntryOrderLocalizationAndRawValuesAreIndependent()
    {
        var recipe = new HmiRecipe();
        var text = HmiMultilingualText.FromText("Neutral <A>");
        text.Texts[1031] = "Translated & B"; text.Texts[1033] = "";
        text.FormattedTexts[1031] = "<b>Formatted</b>";
        var field = new HmiRecipeParameter { Name = "Field <A>", SourceIndex = 0, SourceElementId = 0,
            TextList = new() { Name = "List <A>", RangeType = (HmiListRangeType)37, Comment = HmiMultilingualText.FromText("Comment & B", 1031) } };
        field.TextList.Entries.Add(new() { Name = "Choice <A>", From = int.MinValue, To = 0, Default = true, Text = text });
        field.TextList.Entries.Add(new() { Name = "Choice <A>", From = 0, To = int.MaxValue });
        recipe.Parameters.Add(field);
        var record = new HmiRecipeDataSet { Name = "Record" }; record.Values["Field <A>"] = "17"; recipe.DataSets.Add(record);
        var renderer = new HmiRecipeToHtmlConverter(); var html = renderer.Convert(recipe, 1031);
        foreach (var fragment in new[] { "List &lt;A&gt;", "Comment &amp; B", "Translated &amp; B", "<td data-value-state=\"present\">37</td>", "<td data-value-state=\"present\">17</td>" }) StringAssert.Contains(html, fragment);
        StringAssert.Contains(html, "<td data-value-state=\"missing\">Missing</td><td data-value-state=\"present\">1</td><td data-value-state=\"present\">Choice &lt;A&gt;</td><td data-value-state=\"present\">-2147483648</td><td data-value-state=\"present\">0</td><td data-value-state=\"present\">Yes</td>");
        StringAssert.Contains(html, "<td data-value-state=\"present\">2</td><td data-value-state=\"present\">Choice &lt;A&gt;</td><td data-value-state=\"present\">0</td><td data-value-state=\"present\">2147483647</td><td data-value-state=\"present\">No</td><td data-value-state=\"missing\">Missing</td>");
        Assert.IsFalse(html.Contains("<b>Formatted</b>"));
        html = renderer.Convert(recipe, 1033); Assert.IsFalse(html.Contains("Neutral &lt;A&gt;")); Assert.IsFalse(html.Contains("Translated &amp; B"));
        StringAssert.Contains(html, "<td data-value-state=\"present\">Yes</td><td data-value-state=\"present\"></td>");
        StringAssert.Contains(renderer.Convert(recipe, 1036), "Neutral &lt;A&gt;");
        Assert.AreEqual("17", record.Values["Field <A>"]); Assert.AreEqual(2, field.TextList.Entries.Count);
    }
}
