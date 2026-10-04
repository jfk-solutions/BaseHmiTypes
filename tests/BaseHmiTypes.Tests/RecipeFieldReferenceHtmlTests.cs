using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Recipes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass] public class RecipeFieldReferenceHtmlTests
{
    [TestMethod] public void FieldReferencesKeepSourceIdentityAndEscapedNamesSeparateFromRecords()
    {
        var recipe = new HmiRecipe { Name = "Recipe" };
        var field = new HmiRecipeParameter { Name = "Field <A>", SourceIndex = 0, SourceElementId = 23, TriggerRedraw = false };
        field.References["Tag"] = new() { SourceId = "17-9223372036854775807" };
        field.References["TextList"] = new() { SourceId = "17-24", Name = "List <A> & B" };
        recipe.Parameters.Add(field);
        var html = new HmiRecipeToHtmlConverter().Convert(recipe);
        StringAssert.Contains(html, "Trigger redraw</th>"); StringAssert.Contains(html, "<td>No</td>");
        StringAssert.Contains(html, "<h2>Field references</h2>");
        StringAssert.Contains(html, "<td>0</td><th scope=\"row\">Field &lt;A&gt;</th><td>23</td><td>Tag</td><td>17-9223372036854775807</td><td></td>");
        StringAssert.Contains(html, "List &lt;A&gt; &amp; B"); StringAssert.Contains(html, "No stored records.");
        field.References.Clear(); field.TriggerRedraw = null;
        html = new HmiRecipeToHtmlConverter().Convert(recipe); Assert.IsFalse(html.Contains("<h2>Field references</h2>")); Assert.IsFalse(html.Contains("<td>No</td>"));
    }
}
