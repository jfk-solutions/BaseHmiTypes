using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class SystemDiagnosisAppearanceHtmlTests
{
    [TestMethod]
    public async Task OptionalAppearanceKeepsAreasIndependentAndPreservesRawSettings()
    {
        var control = new HmiSystemDiagnosisControl { Name = "Diagnostics <A> & B", ContentBackgroundColor = HmiColor.FromArgb(255,1,1,1) };
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(control);
        var renderer = new HmiScreenToHtmlConverter();
        Assert.IsFalse((await renderer.ConvertAsync(screen)).Contains("data-system-diagnosis-appearance="));
        var a = control.Appearance = new HmiSystemDiagnosisAppearance
        {
            InformationAreaBackgroundColor = HmiColor.FromArgb(0,17,34,51), InformationAreaForegroundColor = HmiColor.FromArgb(255,2,2,2),
            ErrorBackgroundColor = HmiColor.FromArgb(255,3,3,3), ErrorForegroundColor = HmiColor.FromArgb(255,4,4,4),
            SelectionBackgroundColor = HmiColor.FromArgb(255,5,5,5), SelectionForegroundColor = HmiColor.FromArgb(255,6,6,6),
            AlternatingRowBackgroundColor = HmiColor.FromArgb(255,7,7,7), GridLineColor = HmiColor.FromArgb(255,8,8,8), ShowGridLines = true,
            NavigationForegroundColor = HmiColor.FromArgb(255,9,9,9), ShowNavigationButtons = false,
            ToolbarBackgroundColor = HmiColor.FromArgb(255,10,10,10), UseToolbarBackgroundColor = true, ToolbarAlignment = int.MinValue,
            InformationAreaFocusColor = HmiColor.FromArgb(255,11,11,11), InformationAreaFocusWidth = 0,
            InformationAreaFontReferenceDeviceSize = 123, NavigationFontReferenceDeviceSize = 456, HeaderFontReferenceDeviceSize = 789,
            HeaderBackgroundColor = HmiColor.FromArgb(255,12,12,12), HeaderCornerRadius = 0, HeaderBorderWidth = 0,
            HeaderBackFillStyle = -7, HeaderEdgeStyle = -9, HeaderBorderBackgroundColor = HmiColor.FromArgb(255,13,13,13),
            HeaderFirstGradientColor = HmiColor.FromArgb(255,14,14,14), HeaderSecondGradientColor = HmiColor.FromArgb(255,15,15,15),
            HeaderFirstGradientOffset = -10, HeaderSecondGradientOffset = 120, UseHeaderFirstGradient = true, UseHeaderSecondGradient = true,
            ButtonBackgroundColor = HmiColor.FromArgb(255,16,16,16), ButtonCornerRadius = 0, ButtonBorderWidth = 0,
            ButtonFirstGradientColor = HmiColor.FromArgb(255,17,17,17), UseButtonFirstGradient = true
        };
        string Sample(string html,string kind) => Regex.Match(html,$"<div data-appearance-sample=\"{kind}\"(.*?)</div>").Value;
        var html = await renderer.ConvertAsync(screen);
        StringAssert.Contains(html,"Diagnostics &lt;A&gt; &amp; B"); StringAssert.Contains(html,"Diagnostic data not loaded");
        foreach (var (kind,css) in new[] {("information","background-color: rgba(17,34,51,0);"),("error","background-color: #030303;"),("selection","background-color: #050505;"),("alternate","background-color: #070707;"),("navigation","color: #090909;"),("toolbar","background-color: #0A0A0A;")}) StringAssert.Contains(Sample(html,kind),css);
        StringAssert.Contains(Sample(html,"information"),"border-bottom-color: #080808;");
        StringAssert.Contains(Sample(html,"header"),"linear-gradient("); StringAssert.Contains(Sample(html,"button"),"linear-gradient(");
        StringAssert.Contains(html,"data-toolbar-alignment=\"-2147483648\""); StringAssert.Contains(html,"data-show-navigation-buttons=\"false\"");
        StringAssert.Contains(html,"data-information-area-font-reference-device-size=\"123\""); Assert.IsFalse(html.Contains("font-size: 123px"));
        Assert.IsFalse(HtmlTestMarkup.WithoutScripts(html).Contains("<button")); Assert.AreEqual(-10d,a.HeaderFirstGradientOffset!.StaticValue); Assert.AreEqual(120d,a.HeaderSecondGradientOffset!.StaticValue);
        Assert.AreEqual(HmiColor.FromArgb(255,1,1,1),control.ContentBackgroundColor!.StaticValue);
        a.UseToolbarBackgroundColor = false; a.ShowGridLines = false; a.UseHeaderFirstGradient = false; a.UseHeaderSecondGradient = false; a.UseButtonFirstGradient = false;
        html = await renderer.ConvertAsync(screen);
        Assert.IsFalse(Sample(html,"toolbar").Contains("background-color:")); Assert.IsFalse(Sample(html,"information").Contains("border-bottom:")); Assert.IsFalse(Sample(html,"header").Contains("linear-gradient(")); Assert.IsFalse(Sample(html,"button").Contains("linear-gradient("));
        a.ButtonCornerRadius = -1;
        foreach (var invalid in new[] {-1d,double.NaN,double.PositiveInfinity})
        {
            a.HeaderCornerRadius = invalid; a.HeaderBorderWidth = invalid; a.ButtonBorderWidth = invalid;
            html = await renderer.ConvertAsync(screen);
            foreach (var kind in new[] {"header","button"}) { Assert.IsFalse(Sample(html,kind).Contains("border-radius:")); Assert.IsFalse(Sample(html,kind).Contains("border-width:")); }
        }
        a.HeaderBackgroundColor = null; a.HeaderFirstGradientColor = null; a.HeaderSecondGradientColor = null;
        html = await renderer.ConvertAsync(screen); StringAssert.Contains(html,"data-header-back-fill-style=\"-7\""); Assert.IsFalse(Sample(html,"header").Contains("background-color:"));
    }
}
