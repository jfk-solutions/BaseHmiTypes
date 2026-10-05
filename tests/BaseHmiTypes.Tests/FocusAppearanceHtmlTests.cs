using System.Text.RegularExpressions;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using BaseHmiTypes.Screens.Widgets;
using BaseHmiTypes.Converters.Html;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class FocusAppearanceHtmlTests
{
    [TestMethod] [DataRow("recipe")] [DataRow("trend")] [DataRow("button")]
    public async Task ConfiguredFocusReachesCssWithoutChangingTabOrder(string kind)
    {
        HmiScreenItemBase item = kind == "button" ? new HmiButton() : kind == "trend" ? new HmiTrendControl() : new HmiRecipeControl();
        item.Name = "FocusPreview"; item.TabIndex = 7;
        void Set(HmiColor? color, double? width)
        {
            HmiProperty<HmiColor>? c = color.HasValue ? HmiProperty.Static(color.Value) : null;
            HmiProperty<double>? w = width.HasValue ? HmiProperty.Static(width.Value) : null;
            if (item is HmiWidgetBase widget) { widget.FocusColor = c; widget.FocusWidth = w; }
            else { var window = (HmiWindowBase)item; window.FocusColor = c; window.FocusWidth = w; }
        }
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(item); screen.Layers.Add(layer);
        var renderer = new HmiScreenToHtmlConverter();
        async Task<string> Attributes() => Regex.Match(await renderer.ConvertAsync(screen), "<[^>]*id=\"FocusPreview\"[^>]*>").Value;
        Set(HmiColor.FromArgb(0,17,34,51),0);
        var configured = await Attributes(); StringAssert.Contains(configured,"tabindex=\"7\"");
        StringAssert.Contains(configured,"data-hmi-focus-appearance=\"true\""); StringAssert.Contains(configured,"--hmi-focus-color: rgba(17,34,51,0);"); StringAssert.Contains(configured,"--hmi-focus-width: 0px;");
        Assert.IsFalse(configured.Contains("outline:"));
        foreach (var width in new[] { -1d, double.NaN, double.PositiveInfinity })
        {
            Set(null,width); var invalid = await Attributes();
            Assert.IsFalse(invalid.Contains("data-hmi-focus-appearance=")); Assert.IsFalse(invalid.Contains("--hmi-focus-width:"));
        }
        Set(null,2.5); StringAssert.Contains(await Attributes(),"--hmi-focus-width: 2.5px;");
        Set(null,null); item.TabIndex = null; var missing = await Attributes();
        Assert.IsFalse(missing.Contains("data-focus-")); Assert.IsFalse(missing.Contains("tabindex="));
        var html = await renderer.ConvertAsync(screen);
        StringAssert.Contains(html,"[data-hmi-focus-appearance]:focus-visible"); StringAssert.Contains(html,"var(--hmi-focus-width,1px)");
        StringAssert.Contains(html,"--hmi-focus-color:currentColor"); StringAssert.Contains(html,"--hmi-focus-width:1px");
    }
}
