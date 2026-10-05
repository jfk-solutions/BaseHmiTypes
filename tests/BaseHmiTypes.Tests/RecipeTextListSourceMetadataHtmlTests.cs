using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Recipes;
using BaseHmiTypes.TextGraphicLists;

namespace BaseHmiTypes.Tests;
[TestClass]
public class RecipeTextListSourceMetadataHtmlTests
{
    [TestMethod] [DataRow(0,"SingleValue")] [DataRow(1,"Range")] [DataRow(2,"To")] [DataRow(3,"From")] [DataRow(37,"37")] [DataRow(int.MinValue,"-2147483648")]
    public void SourceReferencesAndModesDoNotReplaceStoredFlagsOrBounds(int mode,string label)
    {
        var recipe=new HmiRecipe();var list=new HmiTextList { DefaultEntryReference=new() { SourceId="17<&>",Name="Choice <A>" } };
        list.Entries.Add(new() { SourceId="17-1<&>",EntryType=(HmiTextListEntryType)mode,Name="Choice <A>",From=-3,To=7,Default=true });
        list.Entries.Add(new() { SourceId="17-2",Name="Choice <A>",From=4,To=9,Default=false });
        recipe.Parameters.Add(new() { Name="Field",TextList=list });var renderer=new HmiRecipeToHtmlConverter();var html=renderer.Convert(recipe);
        foreach(var text in new[] { "Default entry source ID","Default entry name","Entry source ID","Entry mode","17&lt;&amp;&gt;","17-1&lt;&amp;&gt;","Choice &lt;A&gt;","<td data-value-state=\"present\">"+label+"</td>","<td data-value-state=\"present\">-3</td><td data-value-state=\"present\">7</td><td data-value-state=\"present\">Yes</td>" }) StringAssert.Contains(html,text);
        StringAssert.Contains(html,"<td data-value-state=\"present\">17-2</td><td data-value-state=\"missing\">Missing</td>");
        list.DefaultEntryReference.Name=null;html=renderer.Convert(recipe);StringAssert.Contains(html,"<td data-value-state=\"present\">17&lt;&amp;&gt;</td><td data-value-state=\"missing\">Missing</td>");
        Assert.IsTrue(list.Entries[0].Default);Assert.IsFalse(list.Entries[1].Default);Assert.AreEqual(-3,list.Entries[0].From);Assert.AreEqual(7,list.Entries[0].To);Assert.AreEqual(0,recipe.DataSets.Count);
    }
}
