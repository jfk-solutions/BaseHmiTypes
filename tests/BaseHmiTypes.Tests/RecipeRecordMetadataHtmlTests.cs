using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Recipes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class RecipeRecordMetadataHtmlTests
{
    [TestMethod]
    public void RecordMetadataIsIndependentOfValuesAndRetainsTimestampKind()
    {
        var recipe=new HmiRecipe(); var data=new HmiRecipeDataSet { Name="Record <A>", SourceNumber=0 };
        recipe.DataSets.Add(data); var renderer=new HmiRecipeToHtmlConverter();
        Assert.IsFalse(renderer.Convert(recipe).Contains("<h2>Stored record metadata</h2>"));
        data.LastUser="";
        var html=renderer.Convert(recipe);
        StringAssert.Contains(html,"<h2>Stored record metadata</h2>");
        StringAssert.Contains(html,"Record &lt;A&gt;");
        StringAssert.Contains(html,"data-value-state=\"missing\">Missing");
        StringAssert.Contains(html,"data-value-state=\"present\"></td>");
        data.LastModification=new DateTime(2025,2,3,4,5,6,DateTimeKind.Unspecified).AddTicks(1234567);
        data.LastUser="User <B> & C";
        html=renderer.Convert(recipe);
        StringAssert.Contains(html,"<td data-value-state=\"present\">2025-02-03T04:05:06.1234567</td>");
        StringAssert.Contains(html,"User &lt;B&gt; &amp; C");
        Assert.IsFalse(html.Contains("2025-02-03T04:05:06.1234567Z"));
        Assert.AreEqual(0,data.Values.Count); Assert.AreEqual(0,data.SourceValues.Count);
        data.LastModification=DateTime.SpecifyKind(data.LastModification.Value,DateTimeKind.Utc);
        StringAssert.Contains(renderer.Convert(recipe),"2025-02-03T04:05:06.1234567Z");
    }
}
