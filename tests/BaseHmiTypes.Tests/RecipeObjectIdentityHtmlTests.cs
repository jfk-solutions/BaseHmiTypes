using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Recipes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass] public class RecipeObjectIdentityHtmlTests
{
    [TestMethod] [DataRow("exact")] [DataRow("missing")] [DataRow("empty")] [DataRow("whitespace")] [DataRow("unresolved")] [DataRow("ambiguous")]
    public void ViewTargetsMatchOnlyOneExactNonemptyFieldIdentity(string mode)
    {
        var recipe = new HmiRecipe { Name = "Recipe" };
        var first = new HmiRecipeParameter { Name = "Repeated <field>", SourceObjectId = "17-1", SourceIndex = 0 };
        var selected = new HmiRecipeParameter { Name = "Repeated <field>", SourceObjectId = "17-9223372036854775807", SourceIndex = -7 };
        recipe.Parameters.Add(first); recipe.Parameters.Add(selected);
        recipe.DataSets.Add(new() { Name = "Record <&>", SourceObjectId = "17-3" });
        var id = mode == "missing" ? null : mode == "empty" ? "" : mode == "whitespace" ? "17-9223372036854775807 " : mode == "unresolved" ? "17-4" : selected.SourceObjectId;
        if (mode == "empty") selected.SourceObjectId = "";
        if (mode == "ambiguous") first.SourceObjectId = selected.SourceObjectId;
        var view = new HmiRecipeView { Name = "View" }; view.Elements.Add(new() { Name = "Element", TargetElement = new() { SourceId = id, Name = "Unverified target name" } }); recipe.Views.Add(view);
        var renderer = new HmiRecipeToHtmlConverter();
        foreach (var html in new[] { renderer.Convert(recipe), renderer.ConvertFragment(recipe) })
        {
            StringAssert.Contains(html,"<h2>Source object identities</h2>"); StringAssert.Contains(html,"Record &lt;&amp;&gt;"); StringAssert.Contains(html,"<th scope=\"col\">Recipe field</th>");
            StringAssert.Contains(html, mode == "exact" ? "<td data-value-state=\"present\">Repeated &lt;field&gt;</td><td data-value-state=\"present\">-7</td></tr>" : "<td data-value-state=\"missing\">Missing</td><td data-value-state=\"missing\">Missing</td></tr>");
        }
        Assert.AreEqual(2,recipe.Parameters.Count); Assert.AreEqual(id,view.Elements[0].TargetElement!.SourceId); Assert.AreEqual(-7,selected.SourceIndex);
    }
    [TestMethod] public void UnavailableIdentitiesDoNotCreateAnIdentityTable()
    {
        var recipe = new HmiRecipe(); recipe.Parameters.Add(new() { Name = "Field" }); recipe.DataSets.Add(new() { Name = "Record" });
        Assert.IsFalse(new HmiRecipeToHtmlConverter().Convert(recipe).Contains("<h2>Source object identities</h2>"));
        recipe.DataSets[0].SourceObjectId = "<&>";
        StringAssert.Contains(new HmiRecipeToHtmlConverter().ConvertFragment(recipe), "&lt;&amp;&gt;");
    }
}
