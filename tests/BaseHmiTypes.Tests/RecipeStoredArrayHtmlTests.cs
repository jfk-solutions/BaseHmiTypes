using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Recipes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class RecipeStoredArrayHtmlTests
{
    [TestMethod]
    public void ArraysRetainOrderEmptyAndNullMembersIndependentlyOfScalarValues()
    {
        var recipe = new HmiRecipe();
        var record = new HmiRecipeDataSet { Name = "Record <A>", SourceNumber = 0 };
        recipe.DataSets.Add(record);
        var renderer = new HmiRecipeToHtmlConverter();
        Assert.IsFalse(renderer.Convert(recipe).Contains("<h2>Stored array values</h2>"));
        record.SourceArrayValues["Key <A>"] = new List<string?> { "12.3400", null, "", "<member> & end" };
        record.SourceArrayValues["key <a>"] = new List<string?>();
        var html = renderer.Convert(recipe);
        foreach (var fragment in new[] { "<h2>Stored array values</h2>", "Values (storage order)", "Record &lt;A&gt;", "Key &lt;A&gt;", "key &lt;a&gt;", "<ol start=\"0\">", "<li data-value-state=\"present\">12.3400</li><li data-value-state=\"null\">Null</li><li data-value-state=\"present\"></li><li data-value-state=\"present\">&lt;member&gt; &amp; end</li>", "<td>0</td><td>Empty array</td>" })
            StringAssert.Contains(html, fragment);
        Assert.AreEqual(0, record.Values.Count);
        Assert.AreEqual(0, record.SourceValues.Count);
        Assert.AreEqual(2, record.SourceArrayValues.Count);
    }
}
