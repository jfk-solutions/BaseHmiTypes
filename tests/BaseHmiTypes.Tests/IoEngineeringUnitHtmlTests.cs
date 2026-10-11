using System.Net;
using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass]
public class IoEngineeringUnitHtmlTests
{
    private static (HmiScreen Screen, HmiIOField Field) Setup()
    {
        var field = new HmiIOField { Name = "ValueField", X = 10, Y = 20, Width = 200, Height = 30,
            Text = HmiMultilingualText.FromText("12.5"), ReadOnly = true, MaskInput = true, FieldLength = 6,
            Enabled = false, TabIndex = 7, HotKey = "F2", FocusWidth = 2 };
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(field);
        return (screen, field);
    }
    [TestMethod] [DataRow(null)] [DataRow(1031)] [DataRow(1036)]
    public async Task UnitCaptionUsesCultureAndKeepsInputIdentity(int? culture)
    {
        var (screen, field) = Setup(); var unit = HmiMultilingualText.FromText("kg <&>"); unit.Texts[1031] = "Einheit <&>";
        unit.FormattedTexts[1031] = "<script>formatted unit</script>"; field.EngineeringUnitText = HmiProperty.Tag("UnitTag", unit);
        var options = new HmiHtmlConvertOptions { CultureLcid = culture };
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, options: options);
        var input = Regex.Match(html, "<input\\b[^>]*>").Value;
        Assert.AreEqual(1, Regex.Matches(html, "id=\"ValueField\"").Count);
        Assert.AreEqual(1, Regex.Matches(html, "tabindex=\"7\"").Count);
        foreach (var attribute in new[] { "id=\"ValueField\"", "value=\"12.5\"", "type=\"password\"", "readonly=\"readonly\"", "disabled=\"disabled\"", "maxlength=\"6\"", "data-engineering-unit-tag=\"UnitTag\"", "data-hmi-focus-appearance=\"true\"" }) StringAssert.Contains(input, attribute);
        var caption = Regex.Match(html, "<span data-hmi-engineering-unit[^>]*>(.*?)</span>").Groups[1].Value;
        Assert.AreEqual(culture == 1031 ? "Einheit <&>" : "kg <&>", WebUtility.HtmlDecode(caption));
        StringAssert.Contains(html, "left: 10px;top: 20px;width: 200px;height: 30px;");
        Assert.IsFalse(html.Contains("formatted unit")); Assert.AreEqual("12.5", field.Text!.StaticValue!.GetDefaultText());
    }
    [TestMethod]
    public async Task EmptyAndUnavailableUnitKeepTheInputLayout()
    {
        var (screen, field) = Setup(); var renderer = new HmiScreenToHtmlConverter();
        var baseline = Regex.Match(await renderer.ConvertAsync(screen), "<input\\b[^>]*>").Value;
        field.EngineeringUnitText = HmiMultilingualText.FromText("");
        var html = await renderer.ConvertAsync(screen); var input = Regex.Match(html, "<input\\b[^>]*>").Value;
        Assert.AreEqual(baseline, input.Replace(" data-engineering-unit=\"\"", "")); Assert.IsFalse(html.Contains("data-hmi-io-field-unit-container"));
        field.EngineeringUnitText = HmiProperty.Tag<HmiMultilingualText>("UnitTag");
        html = await renderer.ConvertAsync(screen); Assert.IsFalse(html.Contains("data-hmi-io-field-unit-container"));
        StringAssert.Contains(html, "data-engineering-unit-tag=\"UnitTag\"");
    }
    [TestMethod]
    public async Task ExplicitEmptyTranslationKeepsUnitAbsentForThatCulture()
    {
        var (screen, field) = Setup(); var unit = HmiMultilingualText.FromText("kg"); unit.Texts[1031] = ""; field.EngineeringUnitText = unit;
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, options: new() { CultureLcid = 1031 });
        Assert.IsFalse(html.Contains("data-hmi-io-field-unit-container")); StringAssert.Contains(html, "data-engineering-unit=\"\"");
    }
}
