using System.Globalization;
using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class FaceplateButtonNumberHtmlTests
{
    private sealed class Project(HmiFaceplateType type) : HmiProjectBase
    {
        public override ValueTask<HmiFaceplateType?> GetFaceplateAsync(string id, CancellationToken cancellationToken = default) => new(type);
    }
    private static (HmiScreen Root, HmiLayer RootLayer, HmiFaceplateContainer Instance, HmiButton Button, Project Project) Setup(object? value)
    {
        var root = new HmiScreen(); var rootLayer = new HmiLayer(); root.Layers.Add(rootLayer);
        var instance = new HmiFaceplateContainer { FaceplateId = "type" }; instance.InterfaceValues.Add(new() { Name = "Number", Value = value }); rootLayer.Items.Add(instance);
        var type = new HmiFaceplateType(); var layer = new HmiLayer(); type.Layers.Add(layer);
        var button = new HmiButton { Mode = HmiButtonType.GraphicAndText, Pressed = true, Text = HmiMultilingualText.FromText("Caption"), Image = new HmiImageSource { Uri = "picture.svg" }, ImageHorizontalAlignment = HmiHorizontalAlignment.Left };
        layer.Items.Add(button); return (root, rootLayer, instance, button, new Project(type));
    }
    private static HmiFaceplateInterfaceProperty<double> Number() => new() { InterfaceName = "Number", StaticValue = 23 };
    private static async Task<string[]> Render(HmiScreen root, Project project)
    {
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(root, project);
        html = Regex.Replace(html, @"<script\b[^>]*>[\s\S]*?</script>", "", RegexOptions.IgnoreCase);
        return Regex.Matches(html, @"<button\b[^>]*>[\s\S]*?</button>").Select(match => match.Value).ToArray();
    }
    public static IEnumerable<object?[]> Cases()
    {
        foreach (var pair in new (object?, double)[] {
            (2.5, 2.5), (" +2.5 ", 2.5), ("2.5e1", 25), ("1,2.5", 12.5), ("1,,2", 12), ("12,", 12), (".5", .5), ("1.e2", 100),
            (true, 1), (false, 0), (12L, 12), (-2.5, -2.5), ("-0", -0d), ("invalid", 23), ("", 23), ("0x10", 23), (",12", 23),
            ("1.5,2", 23), ("1e1,2", 23), ("2 5", 23), (null, 23), (new object(), 23), ("12\0", 12), ("\u00a012\u00a0", 23),
            ("NaN", double.NaN), ("+nan", double.NaN), ("-NaN", double.NaN), ("infinity", double.PositiveInfinity), (" -Infinity ", double.NegativeInfinity),
            ("1e999", double.PositiveInfinity), ("\u00a0NaN\u00a0", double.NaN) }) yield return [pair.Item1, pair.Item2];
    }
    public static IEnumerable<object?[]> FiniteCases() => Cases().Where(row => double.IsFinite((double)row[1]!));
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task NumericInterfaceStateAndOffsetUseInvariantConversion(object? value, double expected)
    {
        var (root, _, _, button, project) = Setup(value); button.State = Number(); button.PressedContentOffset = Number();
        button.States.Add(new() { Value = -1000, Text = HmiMultilingualText.FromText("First state") });
        button.States.Add(new() { Value = expected, Text = HmiMultilingualText.FromText("Selected state") });
        var html = (await Render(root, project))[0];
        StringAssert.Contains(html, "aria-label=\"" + (double.IsNaN(expected) ? "First state" : "Selected state") + "\"");
        var offset = double.IsFinite(expected) && expected > 0;
        Assert.AreEqual(offset, html.Contains("data-hmi-button-pressed-caption"));
        Assert.AreEqual(offset, Regex.IsMatch(html, @"<img[^>]*transform: translate\("));
        if (offset) StringAssert.Contains(html, "transform: translate(" + Css(expected) + "px, " + Css(expected) + "px)");
    }
    private static string Css(double value) => value.ToString("0.###", CultureInfo.InvariantCulture);
    [TestMethod]
    [DynamicData(nameof(FiniteCases))]
    public async Task NumericButtonBevelAndPaddingUseInterfaceValues(object? value, double expected)
    {
        var (root, _, _, button, project) = Setup(value); button.ThreeDBorderWidth = Number();
        button.Padding = new HmiThickness { Top = Number(), Right = Number(), Bottom = Number(), Left = Number() };
        var html = (await Render(root, project))[0]; Assert.AreEqual(expected > 0, html.Contains("box-shadow: inset"));
        if (expected > 0)
        {
            StringAssert.Contains(html, "box-shadow: inset " + Css(expected) + "px");
            StringAssert.Contains(html, "padding: " + string.Join(" ", Enumerable.Repeat(Css(expected * 2) + "px", 4)) + ";");
        }
    }
    [TestMethod]
    public async Task NumericValuesStayScopedAndTagBindingsRetainFallback()
    {
        var (root, rootLayer, instance, button, project) = Setup(2.5); button.PressedContentOffset = Number();
        foreach (var values in new HmiFaceplateInterfaceValue[][] {
            [new() { Name = "Number", Value = 12 }], [new() { Name = "Number", Value = 4, TagId = "runtime-number" }], [] })
        {
            var other = new HmiFaceplateContainer { FaceplateId = "type" }; foreach (var value in values) other.InterfaceValues.Add(value); rootLayer.Items.Add(other);
        }
        var html = await Render(root, project); Assert.AreEqual(4, html.Length); var expected = new[] { 2.5, 12, 23, 23 };
        for (var i = 0; i < expected.Length; i++) StringAssert.Contains(html[i], "transform: translate(" + Css(expected[i]) + "px, " + Css(expected[i]) + "px)");
        Assert.AreEqual(23d, button.PressedContentOffset.StaticValue);
    }
    [TestMethod]
    public async Task EachPaddingEdgeUsesItsOwnNumericInterfaceBinding()
    {
        var (root, _, instance, button, project) = Setup(.5); button.ThreeDBorderWidth = Number(); button.Padding = new HmiThickness();
        var sides = new[] { "Top", "Right", "Bottom", "Left" };
        for (var i = 0; i < sides.Length; i++)
        {
            instance.InterfaceValues.Add(new() { Name = sides[i], Value = i + 1.5 });
            typeof(HmiThickness).GetProperty(sides[i])!.SetValue(button.Padding, new HmiFaceplateInterfaceProperty<double> { InterfaceName = sides[i], StaticValue = 23 });
        }
        StringAssert.Contains((await Render(root, project))[0], "padding: 2px 3px 4px 5px;");
    }
}
