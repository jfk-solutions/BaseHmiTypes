using BaseHmiTypes.Recipes;
using BaseHmiTypes.Converters.Html;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class RecipeBinaryHtmlTests
{
    [TestMethod]
    public void BinaryValuesKeepScalarArrayEmptyNullAndUnavailableStates()
    {
        var recipe = new HmiRecipe { Name = "Recipe" }; var record = new HmiRecipeDataSet { Name = "Record <A>", SourceNumber = 0 }; recipe.DataSets.Add(record);
        record.SourceBinaryValues["Key<&>"] = new HmiRecipeBinaryValue { SourceType = "CoreBlob", SourceBlobType = 1, SourceDeclaredLength = "6", DecodedByteLength = 6, PayloadBase64 = "AP+APCYA" };
        record.SourceBinaryValues["key<&>"] = new HmiRecipeBinaryValue { SourceType = "<unknown>", SourceBlobType = 37, SourceDeclaredLength = "9223372036854775807" };
        var array = new HmiRecipeBinaryArray { SourceElementType = "CoreBlob" }; array.Values.Add(null); array.Values.Add(new HmiRecipeBinaryValue { SourceType = "CoreBlob", SourceBlobType = 0, SourceDeclaredLength = "0", DecodedByteLength = 0, PayloadBase64 = "" }); record.SourceBinaryArrayValues["Array"] = array;
        record.SourceBinaryArrayValues["Empty"] = new HmiRecipeBinaryArray { SourceElementType = "CoreXmlBlob" };
        var html = new HmiRecipeToHtmlConverter().Convert(recipe);
        foreach (var value in new[] { "Stored binary values", "Record &lt;A&gt;", "Key&lt;&amp;&gt;", "key&lt;&amp;&gt;", "&lt;unknown&gt;", "9223372036854775807", "AP+APCYA", "Empty payload", "Payload unavailable", "Empty array", "data-binary-value-state=\"null\"", "<td>Array</td><td>2</td><td>0</td>", "<td>Array</td><td>2</td><td>1</td>", "<td>Empty</td><td>0</td><td></td><td>CoreXmlBlob</td>" }) StringAssert.Contains(html, value);
        Assert.IsFalse(html.Contains("<unknown>"));
        Assert.AreEqual(2, record.SourceBinaryValues.Count);
    }
}
