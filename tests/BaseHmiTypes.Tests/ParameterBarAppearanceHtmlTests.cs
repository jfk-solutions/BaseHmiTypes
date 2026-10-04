using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class ParameterBarAppearanceHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task ParameterBarsUseIndependentLocalizedFontsAndColors(bool detailed)
    {
        HmiParameterControlBase control = detailed ? new HmiDetailedParameterControl() : new HmiOverviewParameterControl();
        control.ShowToolbar = true; control.ShowStatusBar = true;
        control.ToolbarForegroundColor = HmiColor.FromArgb(255, 17, 34, 51);
        control.StatusBarForegroundColor = HmiColor.FromArgb(255, 68, 85, 102);
        var toolbar = new HmiFont { Name = "ToolbarFace", Size = 14, Bold = true, Underline = true };
        var status = new HmiFont { Name = "StatusFace", Size = 10, Italic = true, Strikethrough = true };
        toolbar.LocalizedFonts[1031] = new() { Name = "LocalizedToolbar <A> & B", Size = 17.5, Italic = true };
        status.LocalizedFonts[1031] = new() { Name = "LocalizedStatus <X> & Y", Size = 11.25, Bold = true };
        control.ToolbarFont = toolbar; control.StatusBarFont = status;
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(control); screen.Layers.Add(layer);
        var renderer = new HmiScreenToHtmlConverter();
        foreach (var lcid in new[] { 1031, 1036 })
        {
            var html = await renderer.ConvertAsync(screen, options: new() { CultureLcid = lcid });
            var toolbarTag = Regex.Match(html, "<div[^>]*role=\"toolbar\"[^>]*>").Value;
            var statusTag = Regex.Match(html, "<div[^>]*role=\"status\"[^>]*>").Value;
            StringAssert.Contains(toolbarTag, "color: #112233;"); StringAssert.Contains(statusTag, "color: #445566;");
            StringAssert.Contains(toolbarTag, lcid == 1031 ? "font-family: LocalizedToolbar &lt;A&gt; &amp; B;font-size: 17.5px;" : "font-family: ToolbarFace;font-size: 14px;");
            StringAssert.Contains(statusTag, lcid == 1031 ? "font-family: LocalizedStatus &lt;X&gt; &amp; Y;font-size: 11.25px;" : "font-family: StatusFace;font-size: 10px;");
            Assert.IsFalse(toolbarTag.Contains("StatusFace")); Assert.IsFalse(toolbarTag.Contains("LocalizedStatus"));
            Assert.IsFalse(statusTag.Contains("ToolbarFace")); Assert.IsFalse(statusTag.Contains("LocalizedToolbar"));
            var details = Regex.Match(html, "<div class=\"hmi-parameter-details\"[^>]*>").Value;
            Assert.IsFalse(details.Contains("ToolbarFace")); Assert.IsFalse(details.Contains("StatusFace"));
        }
        Assert.AreEqual("ToolbarFace", toolbar.Name!.StaticValue); Assert.AreEqual("StatusFace", status.Name!.StaticValue);
        control.ShowToolbar = false; control.ShowStatusBar = false;
        var hidden = await renderer.ConvertAsync(screen); Assert.IsFalse(hidden.Contains("class=\"hmi-parameter-toolbar\"")); Assert.IsFalse(hidden.Contains("class=\"hmi-parameter-status-bar\""));
        Assert.AreSame(toolbar, control.ToolbarFont); Assert.AreSame(status, control.StatusBarFont);
        control.ShowToolbar = true; control.ShowStatusBar = true; control.ToolbarFont = null; control.StatusBarFont = null; control.ToolbarForegroundColor = null;
        var absent = await renderer.ConvertAsync(screen);
        var plainToolbar = Regex.Match(absent, "<div[^>]*role=\"toolbar\"[^>]*>").Value;
        var plainStatus = Regex.Match(absent, "<div[^>]*role=\"status\"[^>]*>").Value;
        Assert.IsFalse(plainToolbar.Contains("font-family:")); Assert.IsFalse(plainToolbar.Contains("color:")); Assert.IsFalse(plainStatus.Contains("font-family:"));
    }
}
