using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class RecipeFontReferenceHtmlTests
{
    private static async Task<string> Render(HmiRecipeControl control)
    {
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(control);
        return await new HmiScreenToHtmlConverter().ConvertAsync(screen);
    }
    public static IEnumerable<object[]> Cases()
    {
        foreach (var (property, key) in new[] { ("HeaderFontReferenceDeviceSize", "header"), ("ContentFontReferenceDeviceSize", "content"), ("StatusBarFontReferenceDeviceSize", "status-bar"), ("ComboBoxFontReferenceDeviceSize", "combo-box") })
            foreach (var value in new[] { 0d, 1.25, -2.5 }) yield return [property, key, value];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task RawFontSizesKeepTheirOwnMetadataWithoutCreatingFonts(string property, string key, double value)
    {
        var control = new HmiRecipeControl(); typeof(HmiRecipeControl).GetProperty(property)!.SetValue(control, new BaseHmiTypes.Screens.Base.HmiStaticProperty<double> { StaticValue = value });
        var html = await Render(control);
        foreach (var candidate in new[] { "header", "content", "status-bar", "combo-box" }) Assert.AreEqual(candidate == key, html.Contains("data-" + candidate + "-font-reference-device-size="));
        StringAssert.Contains(html, "data-" + key + "-font-reference-device-size=\"" + value.ToString(System.Globalization.CultureInfo.InvariantCulture) + "\"");
        Assert.IsNull(control.HeaderFont); Assert.IsNull(control.ContentFont); Assert.IsNull(control.StatusBarFont); Assert.IsNull(control.ComboBoxFont);
    }
    [TestMethod]
    public async Task AbsentRawSizesHaveNoMetadata()
    {
        Assert.IsFalse((await Render(new())).Contains("font-reference-device-size="));
    }
}
