using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass]
public class SelectionMaskHtmlTests
{
    [TestMethod]
    [DataRow(false, 0u, false)]
    [DataRow(false, 0u, true)]
    [DataRow(false, 1u, false)]
    [DataRow(false, 1u, true)]
    [DataRow(false, 5u, false)]
    [DataRow(false, 5u, true)]
    [DataRow(false, 2147483648u, false)]
    [DataRow(false, 2147483648u, true)]
    [DataRow(false, 4294967295u, false)]
    [DataRow(false, 4294967295u, true)]
    [DataRow(true, 0u, false)]
    [DataRow(true, 0u, true)]
    [DataRow(true, 1u, false)]
    [DataRow(true, 1u, true)]
    [DataRow(true, 5u, false)]
    [DataRow(true, 5u, true)]
    [DataRow(true, 2147483648u, false)]
    [DataRow(true, 2147483648u, true)]
    [DataRow(true, 4294967295u, false)]
    [DataRow(true, 4294967295u, true)]
    public async Task EmitsCheckAndRadioSelectionMasks(bool radio, uint mask, bool tagged)
    {
        HmiSelectionGroupBase item = radio ? new HmiRadioButtonGroup() : new HmiCheckBoxGroup();
        item.Name = "Masked"; item.SelectedIndex = 2; item.Items.Add(new HmiSelectionGroupItem { Text = "One" });
        HmiProperty<uint> selected = tagged ? HmiProperty.Tag("Boxes.Process", mask) : HmiProperty.Static(mask);
        if (item is HmiCheckBoxGroup check) check.SelectedFields = selected;
        else if (item is HmiRadioButtonGroup group) group.SelectedFields = selected;
        var layer = new HmiLayer(); layer.Items.Add(item); var screen = new HmiScreen(); screen.Layers.Add(layer);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        var opening = System.Text.RegularExpressions.Regex.Match(html, "<hmi-(?:checkbox|radio-button)-group id=\"Masked\"[^>]*>").Value;
        Assert.IsFalse(string.IsNullOrEmpty(opening));
        StringAssert.Contains(opening, $"selected-fields=\"{mask}\"");
        StringAssert.Contains(opening, "selected-index=\"2\"");
        StringAssert.Contains(html, "text=\"One\"");
    }
}
