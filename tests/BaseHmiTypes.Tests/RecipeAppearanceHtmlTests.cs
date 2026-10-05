using System.Net;
using System.Text.RegularExpressions;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using BaseHmiTypes.Converters.Html;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class RecipeAppearanceHtmlTests
{
    [TestMethod] [DataRow(false,HmiRecipeViewKind.Selector)] [DataRow(true,HmiRecipeViewKind.Selector)] [DataRow(false,HmiRecipeViewKind.Table)] [DataRow(true,HmiRecipeViewKind.Table)]
    public async Task ButtonMetadataAndSelectorTextBordersStayIndependent(bool configured,HmiRecipeViewKind kind)
    {
        var control=new HmiRecipeControl { ViewKind=kind,DefaultRecipeName="Recipe <A> & B",ShowHeader=false };
        control.ColumnDefinitions.Add(new());
        if(configured)
        {
            control.ButtonBackgroundColor=HmiColor.FromArgb(0,1,2,3);
            control.ButtonBorderBackgroundColor=HmiColor.FromArgb(255,2,2,3);
            control.ButtonBorderColor=HmiColor.FromArgb(255,3,2,3);
            control.ButtonFirstGradientColor=HmiColor.FromArgb(255,4,2,3);
            control.ButtonMiddleGradientColor=HmiColor.FromArgb(255,5,2,3);
            control.ButtonSecondGradientColor=HmiColor.FromArgb(255,6,2,3);
            control.ButtonBorderWidth=2.5d;
            control.ButtonCornerRadius=0;
            control.ButtonEdgeStyle=-2147483648;
            control.ButtonBackFillStyle=-2147483648;
            control.ButtonFirstGradientOffset=-10d;
            control.ButtonSecondGradientOffset=120d;
            control.UseButtonFirstGradient=true;
            control.UseButtonSecondGradient=true;
            control.TextualObjectsBorderBackgroundColor=HmiColor.FromArgb(255,15,2,3);
            control.TextualObjectsBorderColor=HmiColor.FromArgb(255,16,2,3);
            control.TextualObjectsBorderWidth=0d;
            control.TextualObjectsCornerRadius=3;
            control.TextualObjectsEdgeStyle=-2147483648;
        }
        var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);
        var converter=new HmiScreenToHtmlConverter();var html=await converter.ConvertAsync(screen);
        foreach(var key in new[] {"data-button-background-color=","data-button-border-background-color=","data-button-border-color=","data-button-first-gradient-color=","data-button-middle-gradient-color=","data-button-second-gradient-color=","data-button-border-width=","data-button-corner-radius=","data-button-edge-style=","data-button-back-fill-style=","data-button-first-gradient-offset=","data-button-second-gradient-offset=","data-use-button-first-gradient=","data-use-button-second-gradient=","data-textual-objects-border-background-color=","data-textual-objects-border-color=","data-textual-objects-border-width=","data-textual-objects-corner-radius=","data-textual-objects-edge-style="}) Assert.AreEqual(configured,html.Contains(key),key);
        var preview=WebUtility.HtmlDecode(Regex.Match(html,"data-button-preview-style=\"([^\"]*)\"").Groups[1].Value);
        Assert.AreEqual(configured,preview.Length>0);Assert.AreEqual(configured,preview.Contains("linear-gradient("));
        Assert.AreEqual(configured && kind==HmiRecipeViewKind.Selector,html.Contains("data-recipe-selector-text="));
        if(configured)
        {
            StringAssert.Contains(preview,"border-width: 2.5px;");StringAssert.Contains(preview,"border-radius: 0px;");StringAssert.Contains(html,"data-button-edge-style=\"-2147483648\"");
            Assert.AreEqual(-10d,control.ButtonFirstGradientOffset!.StaticValue);Assert.AreEqual(120d,control.ButtonSecondGradientOffset!.StaticValue);Assert.AreEqual((byte)0,control.ButtonBackgroundColor!.StaticValue.Alpha);
            if(kind==HmiRecipeViewKind.Selector) { var text=Regex.Match(html,"<span data-recipe-selector-text=\"true\"(.*?)</span>").Value;StringAssert.Contains(text,"border-width: 0px;");StringAssert.Contains(text,"border-radius: 3px;");StringAssert.Contains(text,"Recipe &lt;A&gt; &amp; B");Assert.IsFalse(text.Contains("linear-gradient(")); }
            control.UseButtonFirstGradient=false;control.UseButtonSecondGradient=false;control.TextualObjectsBorderWidth=-1;control.TextualObjectsCornerRadius=-1;
            var disabled=await converter.ConvertAsync(screen);var disabledPreview=Regex.Match(disabled,"data-button-preview-style=\"([^\"]*)\"").Groups[1].Value;Assert.IsFalse(disabledPreview.Contains("linear-gradient("));
            var negative=Regex.Match(disabled,"<span data-recipe-selector-text=\"true\"(.*?)</span>").Value;Assert.IsFalse(negative.Contains("border-width:"));Assert.IsFalse(negative.Contains("border-radius:"));StringAssert.Contains(disabled,"data-textual-objects-border-width=\"-1\"");
        }
    }
    [TestMethod]
    public async Task RawCodesDoNotInventButtonOrTextStyles()
    {
        var control=new HmiRecipeControl { ButtonBackFillStyle=0,ButtonEdgeStyle=-7,TextualObjectsEdgeStyle=int.MaxValue };
        var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html,"data-button-back-fill-style=\"0\"");StringAssert.Contains(html,"data-button-edge-style=\"-7\"");StringAssert.Contains(html,"data-textual-objects-edge-style=\"2147483647\"");
        Assert.IsFalse(html.Contains("data-button-preview-style="));Assert.IsFalse(html.Contains("data-recipe-selector-text="));
    }

}
