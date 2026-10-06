using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Recipes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class RecipeStructuredHtmlTests
{
    private static HmiRecipe Recipe(HmiRecipeStructuredValue value)
    {
        var recipe = new HmiRecipe { Name = "Recipe" }; var record = new HmiRecipeDataSet { Name = "Record <A>", SourceNumber = 0 };
        record.SourceStructuredValues["Key<&>"] = value; recipe.DataSets.Add(record); return recipe;
    }
    private static HmiRecipeStructuredEntry Entry(string key, HmiRecipeStructuredValue value) => new() { Key = key, Value = value };

    [TestMethod]
    public void StructuredValuesRenderBoundariesStatesAndEscapedMetadataInDocumentsAndFragments()
    {
        var root = new HmiRecipeStructuredValue { Kind = HmiRecipeValueKind.Map, SourceType = "CoreMap" };
        root.Entries.Add(Entry("", new())); root.Entries.Add(Entry("Empty", new() { Kind = HmiRecipeValueKind.Scalar, Value = "" }));
        root.Entries.Add(Entry("Text<&>", new() { Kind = HmiRecipeValueKind.Scalar, Value = "<script>alert(1)</script>, [value]" }));
        root.Entries.Add(Entry("EmptyMap", new() { Kind = HmiRecipeValueKind.Map })); root.Entries.Add(Entry("EmptyArray", new() { Kind = HmiRecipeValueKind.Array }));
        var array = new HmiRecipeStructuredValue { Kind = HmiRecipeValueKind.Array }; array.Items.Add(new()); array.Items.Add(new() { Kind = HmiRecipeValueKind.Scalar, Value = "item" }); root.Entries.Add(Entry("Array", array));
        root.Entries.Add(Entry("Binary", new() { Kind = HmiRecipeValueKind.Binary, Binary = new() { SourceType = "CoreBlob", SourceBlobType = 1, SourceDeclaredLength = "3", DecodedByteLength = 3, PayloadBase64 = "AP8D" } }));
        root.Entries.Add(Entry("MissingBinary", new() { Kind = HmiRecipeValueKind.Binary, Binary = new() { SourceBlobType = 37 } }));
        root.Entries.Add(Entry("EmptyBinary", new() { Kind = HmiRecipeValueKind.Binary, Binary = new() { PayloadBase64 = "" } }));
        root.Entries.Add(Entry("Reference", new() { Kind = HmiRecipeValueKind.Reference, Reference = new() { SourceId = "17-23", Name = "Target <A>" } }));
        root.Entries.Add(Entry("Unknown", new() { Kind = HmiRecipeValueKind.Unsupported, SourceType = "<vendor>" }));
        var recipe = Recipe(root); var converter = new HmiRecipeToHtmlConverter();
        var document = converter.Convert(recipe); var fragment = converter.ConvertFragment(recipe);
        foreach (var html in new[] { document, fragment })
        {
            foreach (var text in new[] { "Stored structured values", "Record &lt;A&gt;", "Key&lt;&amp;&gt;", "<dt></dt>", "Text&lt;&amp;&gt;", "&lt;script&gt;alert(1)&lt;/script&gt;, [value]", "Empty map", "Empty array", "<ol start=\"0\">", "AP8D", "Payload unavailable", "Empty payload", "Source reference", "17-23", "Target &lt;A&gt;", "Unsupported value: &lt;vendor&gt;", "data-structured-kind=\"Null\"", "data-value-state=\"missing\"" }) StringAssert.Contains(html, text);
            Assert.IsFalse(html.Contains("<script>")); Assert.IsFalse(html.Contains("<vendor>"));
        }
        Assert.IsFalse(fragment.Contains("<html")); Assert.IsFalse(fragment.Contains("<body"));
    }

    [TestMethod]
    public void RendererGuardsModelCyclesDepthAndPreservesRepeatedAliases()
    {
        var root = new HmiRecipeStructuredValue { Kind = HmiRecipeValueKind.Map };
        var shared = new HmiRecipeStructuredValue { Kind = HmiRecipeValueKind.Map }; shared.Entries.Add(Entry("Value", new() { Kind = HmiRecipeValueKind.Scalar, Value = "shared<&>" }));
        root.Entries.Add(Entry("Self", root)); root.Entries.Add(Entry("First", shared)); root.Entries.Add(Entry("Second", shared));
        var deep = new HmiRecipeStructuredValue { Kind = HmiRecipeValueKind.Array }; var cursor = deep;
        for (var index = 0; index < 130; index++) { var next = new HmiRecipeStructuredValue { Kind = HmiRecipeValueKind.Array }; cursor.Items.Add(next); cursor = next; }
        cursor.Items.Add(new() { Kind = HmiRecipeValueKind.Scalar, Value = "HiddenAtLimit" }); root.Entries.Add(Entry("Deep", deep));
        var html = new HmiRecipeToHtmlConverter().Convert(Recipe(root));
        StringAssert.Contains(html, "Recursive value"); StringAssert.Contains(html, "Depth limit");
        Assert.AreEqual(2, System.Text.RegularExpressions.Regex.Matches(html, "shared&lt;&amp;&gt;").Count);
        Assert.IsFalse(html.Contains("HiddenAtLimit"));
    }

    [TestMethod]
    public void RecipesWithoutStructuredValuesKeepTheSectionAbsent()
    {
        Assert.IsFalse(new HmiRecipeToHtmlConverter().Convert(new HmiRecipe()).Contains("Stored structured values"));
    }
}
