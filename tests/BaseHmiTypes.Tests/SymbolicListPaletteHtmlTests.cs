using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class SymbolicListPaletteHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task ListAndSelectionPalettesRemainSeparateFromStateAppearance(bool readOnly)
    {
        var field = new HmiSymbolicIOField { Name = "Palette", Width = 120, Height = 30, Value = 1, ReadOnly = readOnly,
            SelectionForegroundColor = HmiProperty.Tag("Palette.Selection", HmiColor.FromArgb(0,17,34,51)),
            SelectionBackgroundColor = HmiColor.FromArgb(255,68,85,102),
            ListForegroundColor = HmiColor.FromArgb(255,119,136,153), ListBackgroundColor = HmiColor.FromArgb(255,170,187,204) };
        field.States.Add(new() { Value = 0, Text = HmiMultilingualText.FromText("Other & item"), ForegroundColor = HmiColor.FromArgb(255,255,0,0) });
        field.States.Add(new() { Value = 1, Text = HmiMultilingualText.FromText("Selected <A>"), ForegroundColor = HmiColor.FromArgb(255,255,0,0) });
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(field);
        var renderer = new HmiScreenToHtmlConverter();
        var html = await renderer.ConvertAsync(screen);
        var root = Regex.Match(html, readOnly ? "<input[^>]*id=\"Palette\"[^>]*>" : "<select[^>]*id=\"Palette\"[^>]*>").Value;
        StringAssert.Contains(root,"data-selection-foreground-color=\"rgba(17,34,51,0)\"");
        StringAssert.Contains(root,"data-selection-background-color=\"#445566\"");
        StringAssert.Contains(root,"data-list-foreground-color=\"#778899\"");
        StringAssert.Contains(root,"data-list-background-color=\"#AABBCC\"");
        if (readOnly) { StringAssert.Contains(root,"value=\"Selected &lt;A&gt;\""); Assert.IsFalse(html.Contains("<option")); }
        else
        {
            var options = Regex.Matches(html,"<option[^>]*>.*?</option>").Select(m => m.Value).ToArray(); Assert.AreEqual(2,options.Length);
            StringAssert.Contains(options[0],"color: #778899;"); StringAssert.Contains(options[0],"background-color: #AABBCC;");
            StringAssert.Contains(options[1],"color: rgba(17,34,51,0);"); StringAssert.Contains(options[1],"background-color: #445566;");
            StringAssert.Contains(options[1],"selected=\"selected\""); StringAssert.Contains(options[0],"Other &amp; item");
            field.SelectionForegroundColor = null; html = await renderer.ConvertAsync(screen);
            var selected = Regex.Matches(html,"<option[^>]*>.*?</option>").Last().Value;
            StringAssert.Contains(selected,"color: #778899;"); StringAssert.Contains(selected,"background-color: #445566;");
        }
        Assert.AreEqual(HmiColor.FromArgb(255,255,0,0),field.States[1].ForegroundColor); Assert.AreEqual(1d,field.Value.StaticValue);
        field.SelectionForegroundColor = null; field.SelectionBackgroundColor = null; field.ListForegroundColor = null; field.ListBackgroundColor = null;
        html = await renderer.ConvertAsync(screen); Assert.IsFalse(html.Contains("data-selection-foreground-color=")); Assert.IsFalse(html.Contains("data-list-background-color="));
        if (!readOnly) StringAssert.Contains(Regex.Matches(html,"<option[^>]*>.*?</option>").Last().Value,"color: #FF0000;");
    }
}
