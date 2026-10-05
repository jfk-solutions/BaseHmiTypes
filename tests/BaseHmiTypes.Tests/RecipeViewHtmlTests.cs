using BaseHmiTypes.Common;
using BaseHmiTypes.Recipes;
using BaseHmiTypes.Converters.Html;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class RecipeViewHtmlTests
{
    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)]
    public void ViewsRenderConditionallyWithEscapedSourceState(int count)
    {
        var recipe=new HmiRecipe { Name="Recipe" };
        if(count>0)
        {
            var label=HmiMultilingualText.FromText("Default <A>");label.Texts[1031]="Ansicht <A> & B";
            var view=new HmiRecipeView { Name="View <A>",SourceId="17-1",SourceNumber=0,DisplayName=label,Statement="",DisplayNameReference=new() { SourceId="17-2",Name="Label <A>" } };recipe.Views.Add(view);
            if(count>1)
            {
                view.Elements.Add(new() { Name="Element <B>",SourceId="17-3",SourceNumber=-1,DisplayName=label,TargetElement=new() { SourceId="17-9223372036854775807" } });
                recipe.Views.Add(new() { Name="Unknown view",Statement="X < 3 & Y > 1" });
            }
        }
        var converter=new HmiRecipeToHtmlConverter();var html=converter.Convert(recipe,1031);
        Assert.AreEqual(count>0,html.Contains("<h2>Recipe views</h2>"));Assert.AreEqual(count>1,html.Contains("<h2>Recipe view elements</h2>"));
        Assert.AreEqual(0,recipe.DataSets.Count);Assert.AreEqual(0,recipe.Parameters.Count);
        if(count>0) { StringAssert.Contains(html,"View &lt;A&gt;");StringAssert.Contains(html,"Ansicht &lt;A&gt; &amp; B");StringAssert.Contains(html,"Label &lt;A&gt;");StringAssert.Contains(html,"data-value-state=\"present\">0</td>");StringAssert.Contains(html,"data-value-state=\"present\"></td>");StringAssert.Contains(converter.Convert(recipe,1033),"Default &lt;A&gt;"); }
        if(count>1) { StringAssert.Contains(html,"X &lt; 3 &amp; Y &gt; 1");StringAssert.Contains(html,"Element &lt;B&gt;");StringAssert.Contains(html,"17-9223372036854775807");StringAssert.Contains(html,"data-value-state=\"present\">-1</td>");StringAssert.Contains(html,"data-value-state=\"missing\">Missing</td>"); }
    }
}
