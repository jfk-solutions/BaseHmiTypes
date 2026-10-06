using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Recipes;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class RecipeFragmentHtmlTests
{
    private static HmiRecipe Recipe()
    {
        var result = new HmiRecipe { Name = "Definition <A>", Comment = "Comment & note", DisplayName = HmiMultilingualText.FromText("Default title") };
        result.DisplayName.Texts[1031] = "Localized <title>";
        var field = new HmiRecipeParameter { Name = "Field <A>", DataType = "Real", DefaultValue = "01.500", Unit = "<unit>", MinimumValue = "-4", MaximumValue = "17", MaximumLength = 23, Required = false };
        field.References["Tag"] = new() { SourceId = "17-23", Name = "Tag <A>" }; result.Parameters.Add(field);
        var record = new HmiRecipeDataSet { Name = "Stored <record>" }; record.Values["Field <A>"] = "001.00";
        record.SourceValues["Extra"] = null; record.SourceArrayValues["Array"] = new List<string?> { "01", null, "" };
        record.SourceBinaryValues["Blob"] = new() { SourceType = "CoreBlob", PayloadBase64 = "AA==", DecodedByteLength = 1 }; result.DataSets.Add(record); return result;
    }
    [TestMethod] [DataRow(1031)] [DataRow(1033)]
    public void FragmentReusesTheEntireStandaloneBody(int culture)
    {
        var model = Recipe(); var converter = new HmiRecipeToHtmlConverter(); var document = converter.Convert(model, culture); var fragment = converter.ConvertFragment(model, culture);
        var body = Regex.Match(document, @"<body>([\s\S]*)</body>").Groups[1].Value;
        var content = Regex.Replace(fragment, @"^<section[^>]*><style>[\s\S]*?</style>", ""); content = Regex.Replace(content, @"</section>$", ""); Assert.AreEqual(body, content);
        Assert.IsFalse(Regex.IsMatch(fragment, @"<(?:html|head|body|meta|script)\b", RegexOptions.IgnoreCase));
        foreach (var text in new[] { "Maximum length", "&lt;unit&gt;", "Tag &lt;A&gt;", "Stored records", "001.00", "Stored array values", "AA==" }) StringAssert.Contains(fragment, text);
        StringAssert.Contains(fragment, ".hmi-recipe-definition th,.hmi-recipe-definition td"); Assert.AreEqual(1, model.DataSets.Count); Assert.AreEqual("Field <A>", model.Parameters[0].Name);
    }
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task LinkedDefinitionShowsCompleteStoredMetadata(bool overview)
    {
        HmiParameterControlBase control = overview ? new HmiOverviewParameterControl() : new HmiDetailedParameterControl();
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(control); screen.Layers.Add(layer); control.DefaultParameterSetType = Recipe();
        var renderer = new HmiScreenToHtmlConverter(); var html = await renderer.ConvertAsync(screen, options: new HmiHtmlConvertOptions { CultureLcid = 1031 });
        StringAssert.Contains(html, "Configured parameter set type: Localized &lt;title&gt;"); StringAssert.Contains(html, new HmiRecipeToHtmlConverter().ConvertFragment(control.DefaultParameterSetType, 1031));
        Assert.AreEqual(1, Regex.Matches(html, "<meta charset=").Count); StringAssert.Contains(html, "Parameter data not loaded");
        var invalidCulture = await renderer.ConvertAsync(screen, options: new HmiHtmlConvertOptions { CultureLcid = int.MinValue });
        StringAssert.Contains(invalidCulture, "Configured parameter set type: Default title");
        if (control is HmiDetailedParameterControl detailed) { detailed.HideDetails = true; var hidden = await renderer.ConvertAsync(screen); Assert.IsFalse(hidden.Contains("class=\"hmi-recipe-definition\"")); StringAssert.Contains(hidden, "data-default-parameter-set-type-field-count=\"1\""); }
    }
    [TestMethod]
    public void EmptyFragmentDoesNotCreateStoredRecords()
    {
        var model = new HmiRecipe(); StringAssert.Contains(new HmiRecipeToHtmlConverter().ConvertFragment(model), "No stored records."); Assert.AreEqual(0, model.DataSets.Count); Assert.AreEqual(0, model.Parameters.Count);
    }
}
