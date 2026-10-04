using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Recipes;
using BaseHmiTypes.Common;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class RecipeHtmlTests
{
    [TestMethod]
    public void LocalizedDuplicateLabelsDoNotChangeRecordKeysOrStoredValues()
    {
        var label = HmiMultilingualText.FromText("Default label");
        label.Texts[1031] = "Gleicher <Name>";
        var recipe = new HmiRecipe { Name = "Engineering recipe", DisplayName = label };
        foreach (var name in new[] { "First", "Second" }) recipe.Parameters.Add(new() { Name = name, DisplayName = label });
        var record = new HmiRecipeDataSet { Name = "Engineering record", DisplayName = label };
        record.Values["First"] = "01.500";
        record.Values["Second"] = "02.750";
        recipe.DataSets.Add(record);
        var converter = new HmiRecipeToHtmlConverter();
        var html = converter.Convert(recipe, 1031);
        StringAssert.Contains(html, "<h1>Gleicher &lt;Name&gt;</h1>");
        StringAssert.Contains(html, "<th scope=\"col\">First</th><th scope=\"col\">Second</th>");
        StringAssert.Contains(html, "<td data-value-state=\"present\">01.500</td><td data-value-state=\"present\">02.750</td>");
        StringAssert.Contains(html, "Engineering record</th>");
        StringAssert.Contains(converter.Convert(recipe, 1033), "<h1>Default label</h1>");
        Assert.AreEqual(2, record.Values.Count);
        Assert.AreEqual("First", recipe.Parameters[0].Name);
    }

    [TestMethod]
    public void RendersMetadataAndRetainsUnmatchedRecordColumns()
    {
        var recipe = new HmiRecipe { Name = "Recipe <A>", Comment = "Engineering & data" };
        recipe.Parameters.Add(new() { SourceIndex = 7, Name = "Pressure", Tag = "PLC.Pressure", DataType = "Real",
            Unit = "bar", MinimumValue = "0.0", MaximumValue = "16.0", Comment = "Setpoint" });
        recipe.Parameters.Add(new() { Name = "Temperature" });
        var record = new HmiRecipeDataSet { Name = "Record 01" };
        record.Values["pressure"] = "01.500";
        record.Values["X0002Y0003"] = "24";
        recipe.DataSets.Add(record);
        var html = new HmiRecipeToHtmlConverter().Convert(recipe);
        foreach (var value in new[] { "Recipe &lt;A&gt;", "Engineering &amp; data", "<td>7</td>", "PLC.Pressure", "Real",
                     "bar", "0.0", "16.0", "Setpoint", "Record 01", "01.500", "X0002Y0003" })
            StringAssert.Contains(html, value);
        StringAssert.Contains(html, "<th scope=\"col\">Pressure</th><th scope=\"col\">Temperature</th><th scope=\"col\">X0002Y0003</th>");
        StringAssert.Contains(html, "<td data-value-state=\"present\">01.500</td><td data-value-state=\"missing\">Missing</td><td data-value-state=\"present\">24</td>");
    }

    [TestMethod]
    public void DistinguishesEmptyNullMissingAndEscapesRecordContent()
    {
        var recipe = new HmiRecipe();
        foreach (var name in new[] { "Empty", "Null", "Missing", "Markup" }) recipe.Parameters.Add(new() { Name = name });
        var record = new HmiRecipeDataSet { Name = "<script>record</script>" };
        record.Values["Empty"] = "";
        record.Values["Null"] = null;
        record.Values["Markup"] = "<script>alert('x')</script> & ü";
        recipe.DataSets.Add(record);
        var html = new HmiRecipeToHtmlConverter().Convert(recipe);
        StringAssert.Contains(html, "<td data-value-state=\"present\"></td><td data-value-state=\"null\">Null</td><td data-value-state=\"missing\">Missing</td>");
        StringAssert.Contains(html, "&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; &#252;");
        Assert.IsFalse(html.Contains("<script>"));
    }

    [TestMethod]
    public void EmptyDefinitionDoesNotInventRecords()
    {
        var html = new HmiRecipeToHtmlConverter().Convert(new HmiRecipe());
        StringAssert.Contains(html, "<h1>Recipe</h1>");
        StringAssert.Contains(html, "No stored records.");
        Assert.IsFalse(html.Contains("data-value-state" + "=\""));
    }

    [TestMethod]
    public void DistinctUnicodeFieldNamesAndSupplementaryTextSurvive()
    {
        var recipe = new HmiRecipe();
        var record = new HmiRecipeDataSet();
        foreach (var name in new[] { "ß", "SS", "ı", "I", "ſ", "S" })
        {
            recipe.Parameters.Add(new() { Name = name });
            record.Values[name] = "😀";
        }
        recipe.DataSets.Add(record);
        var html = new HmiRecipeToHtmlConverter().Convert(recipe);
        Assert.AreEqual(6, html.Split(new[] { "<td data-value-state=\"present\">&#128512;</td>" }, StringSplitOptions.None).Length - 1);
    }
}
