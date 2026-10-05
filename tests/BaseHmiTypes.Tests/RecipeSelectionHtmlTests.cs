using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass]
public class RecipeSelectionHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task SelectionIsOptionalIndependentAndHeadersUsePlainLocalizedText(bool selector)
    {
        var control=new HmiRecipeControl {ViewKind=selector?HmiRecipeViewKind.Selector:HmiRecipeViewKind.Table,DefaultRecipeName="Recipe <A>"};var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(control);screen.Layers.Add(layer);var renderer=new HmiScreenToHtmlConverter();var options=new HmiHtmlConvertOptions {CultureLcid=1031};async Task<string> Html()=>HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(screen,options:options));
        Assert.IsFalse((await Html()).Contains("hmi-recipe-selection-preview"));Assert.IsFalse((await Html()).Contains("data-selection-background-color"));
        control.SelectionForegroundColor=HmiColor.FromArgb(255,68,85,102);var html=await Html();var sample=Regex.Match(html,"<div class=\"hmi-recipe-selection-preview\"[^>]*>").Value;StringAssert.Contains(sample,"color: #445566;");Assert.IsFalse(sample.Contains("background-color:"));
        control.SelectionBackgroundColor=HmiColor.FromArgb(0,17,34,51);control.ContentBackgroundColor=HmiColor.FromArgb(255,1,2,3);control.HeaderBackgroundColor=HmiColor.FromArgb(255,119,136,153);control.ContentFont=new() {Name="Content",Size=13};control.ContentFont.LocalizedFonts[1031]=new() {Name="Localized <A> & B",Size=17};
        var header=HmiMultilingualText.FromText("Plain <A> & B",1031);header.Texts[1033]="English";header.FormattedTexts[1031]="<b>Formatted payload</b>";control.ColumnDefinitions.Add(new() {HeaderText=header});var empty=HmiMultilingualText.FromText("",1031);empty.FormattedTexts[1031]="<b>Must stay empty</b>";control.ColumnDefinitions.Add(new() {HeaderText=empty});
        html=await Html();sample=Regex.Match(html,"<div class=\"hmi-recipe-selection-preview\"[^>]*>").Value;foreach(var part in new[] {"background-color: rgba(17,34,51,0);","color: #445566;","font-family: Localized &lt;A&gt; &amp; B;font-size: 17px;"})StringAssert.Contains(sample,part);Assert.IsFalse(sample.Contains("#010203"));Assert.IsFalse(sample.Contains("#778899"));StringAssert.Contains(html,"data-selection-background-color");StringAssert.Contains(html,"Selection appearance preview");Assert.IsFalse(html.Contains("Formatted payload"));Assert.IsFalse(html.Contains("Must stay empty"));Assert.IsFalse(html.Contains("<button"));
        if(!selector) {StringAssert.Contains(html,"Plain &lt;A&gt; &amp; B</th>");StringAssert.Contains(html,">Recipe data not loaded</td>");StringAssert.Contains(html,"></th>");Assert.AreEqual(2,Regex.Matches(html,"<tr[ >]").Count);}else StringAssert.Contains(html,"Recipe &lt;A&gt;");
        options.CultureLcid=1033;html=await Html();sample=Regex.Match(html,"<div class=\"hmi-recipe-selection-preview\"[^>]*>").Value;StringAssert.Contains(sample,"font-family: Content;font-size: 13px;");if(!selector)StringAssert.Contains(html,"English</th>");
        control.ShowHeader=false;html=await Html();Assert.IsFalse(html.Contains("<th "));StringAssert.Contains(html,"Selection appearance preview");control.SelectionForegroundColor=null;sample=Regex.Match(await Html(),"<div class=\"hmi-recipe-selection-preview\"[^>]*>").Value;Assert.IsFalse(sample.Contains("color: #"));StringAssert.Contains(sample,"background-color: rgba(17,34,51,0);");Assert.AreEqual("<b>Formatted payload</b>",header.FormattedTexts[1031]);
    }
}
