using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class SelectionBorderFlashHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var radio in new[] {false,true})
        foreach (var inside in new[] {false,true})
        foreach (var rate in Enum.GetValues<HmiBlinkRate>())
        foreach (var conditional in new[] {false,true})
            yield return [radio, inside, rate, conditional];
    }

    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task EmitsPanelFlashDuration(bool radio, bool inside, HmiBlinkRate rate, bool conditional)
    {
        HmiSelectionGroupBase item = radio ? new HmiRadioButtonGroup() : new HmiCheckBoxGroup();
        item.Name = "Flash"; item.BorderWidth = 8; item.BorderStyle = 1;
        if (item is HmiCheckBoxGroup check) check.DrawStrokeInsideFrame = inside;
        else ((HmiRadioButtonGroup)item).DrawStrokeInsideFrame = inside;
        item.BorderColor = HmiProperty.Blink(HmiColor.FromArgb(255,11,12,13), HmiColor.FromArgb(255,14,15,16), rate,
            conditional ? HmiBlinkCondition.WhenTrue : HmiBlinkCondition.Always, conditional ? "Box.Flash" : null);
        var layer = new HmiLayer(); layer.Items.Add(item); var screen = new HmiScreen(); screen.Layers.Add(layer);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var opening = System.Text.RegularExpressions.Regex.Match(html, "<hmi-(?:checkbox|radio-button)-group id=\"Flash\"[^>]*>").Value;
        var duration = rate == HmiBlinkRate.Slow ? "2" : rate == HmiBlinkRate.Fast ? "0.5" : "1";
        StringAssert.Contains(opening, $"frame-border-flash-duration=\"{duration}\"");
        StringAssert.Contains(opening, "--hmi-border-color-off: #0B0C0D;");
        StringAssert.Contains(opening, "--hmi-border-color-on: #0E0F10;");
        StringAssert.Contains(opening, "frame-border-style=\"dashed\"");
    }

    [TestMethod]
    [DataRow(false,false)]
    [DataRow(false,true)]
    [DataRow(true,false)]
    [DataRow(true,true)]
    public async Task BackgroundFlashDoesNotEnableBorderFlash(bool radio, bool inside)
    {
        HmiSelectionGroupBase item = radio ? new HmiRadioButtonGroup() : new HmiCheckBoxGroup();
        item.Name = "Flash"; item.BorderWidth = 8; item.BorderColor = HmiColor.FromArgb(255,11,12,13);
        item.BackgroundColor = HmiProperty.Blink(HmiColor.FromArgb(255,21,22,23), HmiColor.FromArgb(255,24,25,26));
        if (item is HmiCheckBoxGroup check) check.DrawStrokeInsideFrame = inside;
        else ((HmiRadioButtonGroup)item).DrawStrokeInsideFrame = inside;
        var layer = new HmiLayer(); layer.Items.Add(item); var screen = new HmiScreen(); screen.Layers.Add(layer);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var opening = System.Text.RegularExpressions.Regex.Match(html, "<hmi-(?:checkbox|radio-button)-group id=\"Flash\"[^>]*>").Value;
        Assert.IsFalse(opening.Contains("frame-border-flash-duration", StringComparison.Ordinal));
        StringAssert.Contains(opening, "hmi-background-color-flash");
    }
}
