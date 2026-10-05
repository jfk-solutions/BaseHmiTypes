using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class NcPartProgramHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task AppearancePreviewKeepsMetadataAndDoesNotInventPrograms(bool configured)
    {
        var control = new HmiNcPartProgramControl { Name = "Program <A> & B", Resizable = configured };
        if(configured)
        {
            control.ListBackgroundColor = HmiColor.FromArgb(0,1,2,3);
            control.ListForegroundColor = HmiColor.FromArgb(255,2,2,3);
            control.SelectionBackgroundColor = HmiColor.FromArgb(255,3,2,3);
            control.SelectionForegroundColor = HmiColor.FromArgb(255,4,2,3);
            control.AlternatingRowBackgroundColor = HmiColor.FromArgb(255,5,2,3);
            control.GridLineColor = HmiColor.FromArgb(255,6,2,3);
            control.ShowGridLines = true;
            control.ButtonBackgroundColor = HmiColor.FromArgb(255,8,2,3);
            control.ButtonBorderBackgroundColor = HmiColor.FromArgb(255,9,2,3);
            control.ButtonBorderColor = HmiColor.FromArgb(255,10,2,3);
            control.ButtonFirstGradientColor = HmiColor.FromArgb(255,11,2,3);
            control.ButtonMiddleGradientColor = HmiColor.FromArgb(255,12,2,3);
            control.ButtonSecondGradientColor = HmiColor.FromArgb(255,13,2,3);
            control.ButtonBorderWidth = 2.5d;
            control.ButtonCornerRadius = 0;
            control.ButtonEdgeStyle = -7;
            control.ButtonBackFillStyle = -7;
            control.ButtonFirstGradientOffset = -10d;
            control.ButtonSecondGradientOffset = 120d;
            control.UseButtonFirstGradient = true;
            control.UseButtonSecondGradient = true;
            control.TextualObjectsBorderBackgroundColor = HmiColor.FromArgb(255,22,2,3);
            control.TextualObjectsBorderColor = HmiColor.FromArgb(255,23,2,3);
            control.TextualObjectsBorderWidth = 2.5d;
            control.TextualObjectsCornerRadius = -3;
            control.TextualObjectsEdgeStyle = -7;
            control.ContentFont = new HmiFont { Name = "Preview Serif", Size = 13 };
        }
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(control); screen.Layers.Add(layer);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html,"Program &lt;A&gt; &amp; B"); StringAssert.Contains(html,"NC program data not decoded"); StringAssert.Contains(html,"data-preview=\"appearance\"");
        foreach(var key in new[] {"data-list-background-color=","data-list-foreground-color=","data-selection-background-color=","data-selection-foreground-color=","data-alternating-row-background-color=","data-grid-line-color=","data-show-grid-lines=","data-button-background-color=","data-button-border-background-color=","data-button-border-color=","data-button-first-gradient-color=","data-button-middle-gradient-color=","data-button-second-gradient-color=","data-button-border-width=","data-button-corner-radius=","data-button-edge-style=","data-button-back-fill-style=","data-button-first-gradient-offset=","data-button-second-gradient-offset=","data-use-button-first-gradient=","data-use-button-second-gradient=","data-textual-objects-border-background-color=","data-textual-objects-border-color=","data-textual-objects-border-width=","data-textual-objects-corner-radius=","data-textual-objects-edge-style="}) Assert.AreEqual(configured,html.Contains(key),key);
        Assert.AreEqual(configured,html.Contains("overflow: hidden;resize: both;"));
        foreach(var kind in new[] {"list","selection","alternate","button","text"}) Assert.AreEqual(1,Regex.Matches(html,$"data-appearance=\"{kind}\"").Count);
        var button = Regex.Match(html,"<div data-appearance=\"button\"(.*?)</div>").Value;
        var text = Regex.Match(html,"<div data-appearance=\"text\"(.*?)</div>").Value;
        Assert.AreEqual(configured,button.Contains("linear-gradient(")); Assert.IsFalse(text.Contains("border-radius:"));
        if(configured)
        {
            StringAssert.Contains(button,"border-radius: 0px;"); StringAssert.Contains(button,"border-width: 2.5px;");
            StringAssert.Contains(html,"font-family: Preview Serif;"); StringAssert.Contains(html,"data-button-edge-style=\"-7\"");
            Assert.AreEqual(-10d,control.ButtonFirstGradientOffset!.StaticValue); Assert.AreEqual(120d,control.ButtonSecondGradientOffset!.StaticValue); Assert.AreEqual((byte)0,control.ListBackgroundColor!.StaticValue.Alpha);
            control.UseButtonFirstGradient = false; control.UseButtonSecondGradient = false;
            var disabled = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
            Assert.IsFalse(Regex.Match(disabled,"<div data-appearance=\"button\"(.*?)</div>").Value.Contains("linear-gradient("));
        }
    }
}
