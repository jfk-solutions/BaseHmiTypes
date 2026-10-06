using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class FaceplateInputPropertyHtmlTests
{
    private sealed class Project(HmiFaceplateType type) : HmiProjectBase
    {
        public override ValueTask<HmiFaceplateType?> GetFaceplateAsync(string id, CancellationToken cancellationToken = default) => new(type);
    }
    private static (HmiScreen Root, Project Project, HmiLayer Layer, HmiFaceplateContainer Instance) Setup(object? value)
    {
        var root = new HmiScreen(); var rootLayer = new HmiLayer(); var instance = new HmiFaceplateContainer { FaceplateId = "type" };
        root.Layers.Add(rootLayer); rootLayer.Items.Add(instance); instance.InterfaceValues.Add(new() { Name = "Value", Value = value });
        var type = new HmiFaceplateType(); var layer = new HmiLayer(); type.Layers.Add(layer); return (root, new Project(type), layer, instance);
    }
    private static string OpeningTag(string html, string tag) => Regex.Match(Regex.Replace(html, @"<script\b[^>]*>[\s\S]*?</script>", "", RegexOptions.IgnoreCase), "<" + tag + @"\b[^>]*>").Value;
    private static HmiFaceplateInterfaceProperty<bool> Flag(bool fallback) => new() { InterfaceName = "Value", StaticValue = fallback };

    [TestMethod]
    [DataRow(true, 1)]
    [DataRow(false, 0)]
    [DataRow(0, 0)]
    [DataRow(1, 1)]
    [DataRow(-2, 1)]
    [DataRow(double.NaN, 1)]
    [DataRow(double.PositiveInfinity, 1)]
    [DataRow(" TrUe ", 1)]
    [DataRow(" FALSE ", 0)]
    [DataRow("invalid", -1)]
    [DataRow(null, -1)]
    public async Task BooleanInputConsumersUseInterfaceValues(object? value, int expected)
    {
        var (root, project, layer, instance) = Setup(value); var button = new HmiButton { Enabled = Flag(true) };
        var field = new HmiIOField { Enabled = Flag(true), ReadOnly = Flag(false), MaskInput = Flag(false) };
        var box = new HmiTextBox { Enabled = Flag(true), ReadOnly = Flag(false), Resizable = Flag(false) };
        instance.InterfaceValues.Add(new() { Name = "Appearance", Value = true });
        field.UseDisabledForegroundColor = new HmiFaceplateInterfaceProperty<bool> { InterfaceName = "Appearance", StaticValue = false };
        field.ForegroundColor = HmiColor.FromArgb(255, 17, 18, 19); field.DisabledForegroundColor = HmiColor.FromArgb(255, 1, 2, 3);
        layer.Items.Add(button); layer.Items.Add(field); layer.Items.Add(box);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(root, project);
        foreach (var tag in new[] { "button", "input", "textarea" })
        {
            var opening = OpeningTag(html, tag);
            Assert.AreEqual(expected == 0, opening.Contains("disabled=\"disabled\""));
            Assert.AreEqual(expected == 0, opening.Contains("aria-disabled=\"true\""));
            Assert.AreEqual(expected == 0, opening.Contains("pointer-events: none"));
        }
        foreach (var tag in new[] { "input", "textarea" }) Assert.AreEqual(expected == 1, OpeningTag(html, tag).Contains("readonly=\"readonly\""));
        Assert.AreEqual(expected == 1, OpeningTag(html, "input").Contains("type=\"password\""));
        Assert.AreEqual(expected == 1, OpeningTag(html, "textarea").Contains("resize: both"));
        Assert.AreEqual(expected == 0, OpeningTag(html, "input").Contains("color: #010203;"));
    }

    [TestMethod]
    [DataRow(12, 12)]
    [DataRow(2.5, 2)]
    [DataRow(3.5, 4)]
    [DataRow(-2.5, -2)]
    [DataRow(-3.5, -4)]
    [DataRow(" +12 ", 12)]
    [DataRow("12.0", 23)]
    [DataRow("0x10", 23)]
    [DataRow("", 23)]
    [DataRow(true, 1)]
    [DataRow(false, 0)]
    [DataRow(2147483648L, 23)]
    [DataRow(double.NaN, 23)]
    [DataRow(double.PositiveInfinity, 23)]
    [DataRow(null, 23)]
    [DataRow(12L, 12)]
    public async Task FieldLengthUsesInt32ConversionAndFallback(object? value, int expected)
    {
        var (root, project, layer, _) = Setup(value);
        HmiFaceplateInterfaceProperty<int> Length() => new() { InterfaceName = "Value", StaticValue = 23 };
        layer.Items.Add(new HmiIOField { FieldLength = Length() }); layer.Items.Add(new HmiTextBox { FieldLength = Length() });
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(root, project);
        StringAssert.Contains(OpeningTag(html, "input"), "maxlength=\"" + expected + "\"");
        if (expected > 0) StringAssert.Contains(OpeningTag(html, "textarea"), "maxlength=\"" + expected + "\"");
        else Assert.IsFalse(OpeningTag(html, "textarea").Contains("maxlength="));
    }
}
