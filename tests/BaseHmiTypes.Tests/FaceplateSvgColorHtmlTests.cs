using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class FaceplateSvgColorHtmlTests
{
    private static readonly HmiColor Fallback = HmiColor.FromArgb(255, 17, 18, 19);
    private static readonly Dictionary<string, HmiColor> Colors = new() {
        ["Fill"] = HmiColor.FromArgb(255, 1, 2, 3), ["Line"] = HmiColor.FromArgb(255, 4, 5, 6), ["Border"] = HmiColor.FromArgb(255, 7, 8, 9),
        ["Foreground"] = HmiColor.FromArgb(255, 10, 11, 12), ["Disabled"] = HmiColor.FromArgb(255, 13, 14, 15), ["Pattern"] = HmiColor.FromArgb(255, 16, 17, 18)
    };
    private sealed class Project(HmiFaceplateType type) : HmiProjectBase
    {
        public override ValueTask<HmiFaceplateType?> GetFaceplateAsync(string id, CancellationToken cancellationToken = default) => new(type);
    }
    private static (HmiScreen Root, HmiLayer RootLayer, Project Project) Setup(HmiShapeBase item, string mode = "literal")
    {
        var root = new HmiScreen(); var rootLayer = new HmiLayer(); root.Layers.Add(rootLayer); var instance = new HmiFaceplateContainer { FaceplateId = "type" }; rootLayer.Items.Add(instance);
        var type = new HmiFaceplateType(); var layer = new HmiLayer(); type.Layers.Add(layer); layer.Items.Add(item); item.Name = "Probe"; item.Width = 100; item.Height = 40;
        foreach (var (name, color) in Colors) instance.InterfaceValues.Add(new() { Name = name,
            Value = mode is "literal" or "tag" ? color : mode == "null" ? null : mode == "invalid" ? "#010203" : new Dictionary<string, object> { ["Alpha"] = 255, ["Red"] = "1", ["Green"] = 2, ["Blue"] = 3 }, TagId = mode == "tag" ? "runtime-color" : null });
        return (root, rootLayer, new Project(type));
    }
    private static HmiFaceplateInterfaceProperty<HmiColor> Bound(string name) => new() { InterfaceName = name, StaticValue = Fallback };
    private static async Task<string> Render(HmiScreen root, Project project) => Regex.Replace(await new HmiScreenToHtmlConverter().ConvertAsync(root, project), @"<script\b[^>]*>[\s\S]*?</script>", "", RegexOptions.IgnoreCase);
    public static IEnumerable<object[]> Cases()
    {
        foreach (var shape in new[] { "Circle", "Ellipse" }) foreach (var source in new[] { "Line", "Border", "Foreground", "Disabled" }) foreach (var mode in new[] { "literal", "invalid", "null", "tag", "malformed" }) yield return [shape, source, mode];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task SvgFillAndStrokeUseScopedInterfaceColors(string shape, string source, string mode)
    {
        HmiShapeBase item = shape == "Circle" ? new HmiCircle() : new HmiEllipse(); item.BackgroundColor = Bound("Fill");
        if (source == "Line") { item.LineColor = Bound("Line"); item.BorderColor = Bound("Border"); item.ForegroundColor = Bound("Foreground"); }
        else if (source == "Border") { item.BorderColor = Bound("Border"); item.ForegroundColor = Bound("Foreground"); }
        else { item.ForegroundColor = Bound("Foreground"); if (source == "Disabled") { item.Enabled = false; item.UseDisabledForegroundColor = true; item.DisabledForegroundColor = Bound("Disabled"); } }
        var (root, _, project) = Setup(item, mode); var html = await Render(root, project);
        var expected = mode != "literal" ? "#111213" : source switch { "Line" => "#040506", "Border" => "#070809", "Foreground" => "#0A0B0C", _ => "#0D0E0F" };
        StringAssert.Contains(html, "fill=\"" + (mode == "literal" ? "#010203" : "#111213") + "\""); StringAssert.Contains(html, "stroke=\"" + expected + "\""); Assert.AreEqual(Fallback, item.BackgroundColor.StaticValue);
    }
    [TestMethod]
    public async Task MarkerGeometryUsesResolvedStrokeColor()
    {
        var item = new HmiLine { LineColor = Bound("Line"), StartMarker = HmiLineMarker.FilledArrow, EndMarker = HmiLineMarker.FilledCircle };
        var (root, _, project) = Setup(item); var html = await Render(root, project); StringAssert.Contains(html, "stroke=\"#040506\""); Assert.AreEqual(2, Regex.Matches(html, "fill=\"#040506\"").Count);
    }
    [TestMethod]
    [DataRow(false)]
    [DataRow(true)]
    public async Task PatternColorResolvesExplicitOrStrokeFallback(bool explicitColor)
    {
        var item = new HmiEllipse { BackgroundColor = Bound("Fill"), LineColor = Bound("Line"), FillPattern = HmiFillPattern.Horizontal }; if (explicitColor) item.PatternColor = Bound("Pattern");
        var (root, _, project) = Setup(item); var html = await Render(root, project); StringAssert.Contains(html, "fill=\"url(#hmi-pattern-Probe)\""); StringAssert.Contains(html, "fill=\"#010203\"");
        StringAssert.Contains(html, "stroke=\"" + (explicitColor ? "#101112" : "#040506") + "\" stroke-width=\"1\"");
    }
    [TestMethod]
    public async Task FillAnimationStopsUseResolvedFillColor()
    {
        var item = new HmiEllipse { BackgroundColor = Bound("Fill"), FillAnimation = new HmiFillAnimation { ExpressionFallback = 50 } };
        var (root, _, project) = Setup(item); var html = await Render(root, project); StringAssert.Contains(html, "fill=\"url(#hmi-fill-Probe)\""); StringAssert.Contains(html, "stop-color=\"#010203\"");
    }
    [TestMethod]
    public async Task SvgFillAndStrokeBlinkSnapshotsRetainPrecedence()
    {
        var item = new HmiEllipse { BackgroundColor = HmiProperty.Blink(Colors["Fill"], Fallback), LineColor = HmiProperty.Blink(Colors["Line"], Fallback) };
        var (root, _, project) = Setup(item); var html = await Render(root, project); StringAssert.Contains(html, "--hmi-background-color-off: #010203;"); StringAssert.Contains(html, "--hmi-border-color-off: #040506;");
        StringAssert.Contains(html, "--hmi-background-color-on: #111213;"); StringAssert.Contains(html, "--hmi-border-color-on: #111213;");
    }
    [TestMethod]
    public async Task RepeatedSvgInstancesUseIndependentFillBindings()
    {
        var item = new HmiEllipse { BackgroundColor = Bound("Fill") }; var (root, rootLayer, project) = Setup(item); var second = new HmiFaceplateContainer { FaceplateId = "type" };
        second.InterfaceValues.Add(new() { Name = "Fill", Value = Fallback }); rootLayer.Items.Add(second);
        var html = await Render(root, project); StringAssert.Contains(html, "fill=\"#010203\""); StringAssert.Contains(html, "fill=\"#111213\""); Assert.AreEqual(Fallback, item.BackgroundColor.StaticValue);
    }
}
