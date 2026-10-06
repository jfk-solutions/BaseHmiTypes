using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class FaceplateCommonColorHtmlTests
{
    private static readonly HmiColor Fallback = HmiColor.FromArgb(255, 17, 18, 19);
    private static readonly Dictionary<string, HmiColor> Colors = new() {
        ["ForegroundColor"] = HmiColor.FromArgb(255, 1, 2, 3), ["BackgroundColor"] = HmiColor.FromArgb(255, 4, 5, 6), ["BorderColor"] = HmiColor.FromArgb(255, 7, 8, 9),
        ["DisabledForegroundColor"] = HmiColor.FromArgb(255, 10, 11, 12), ["DisabledForegroundShadowColor"] = HmiColor.FromArgb(255, 13, 14, 15),
        ["LineColor"] = HmiColor.FromArgb(255, 16, 17, 18), ["TrackColor"] = HmiColor.FromArgb(255, 19, 20, 21)
    };
    private sealed class Project(HmiFaceplateType type) : HmiProjectBase
    {
        public override ValueTask<HmiFaceplateType?> GetFaceplateAsync(string id, CancellationToken cancellationToken = default) => new(type);
    }
    private static (HmiScreen Root, HmiLayer RootLayer, Project Project) Setup(HmiPaintedScreenItemBase item, string mode = "literal")
    {
        var root = new HmiScreen(); var rootLayer = new HmiLayer(); root.Layers.Add(rootLayer);
        var instance = new HmiFaceplateContainer { FaceplateId = "type" }; rootLayer.Items.Add(instance);
        var type = new HmiFaceplateType(); var layer = new HmiLayer(); type.Layers.Add(layer); layer.Items.Add(item); item.Name = "Probe";
        foreach (var (name, color) in Colors) instance.InterfaceValues.Add(new() { Name = name,
            Value = mode is "literal" or "tag" ? color : mode == "null" ? null : mode == "invalid" ? "#010203" : new Dictionary<string, object> { ["Alpha"] = 255, ["Red"] = "1", ["Green"] = 2, ["Blue"] = 3 },
            TagName = mode == "tag" ? "RuntimeColor" : null });
        return (root, rootLayer, new Project(type));
    }
    private static HmiFaceplateInterfaceProperty<HmiColor> Bound(string name) => new() { InterfaceName = name, StaticValue = Fallback };
    private static async Task<string[]> Openings(HmiScreen root, Project project)
    {
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(root, project);
        html = Regex.Replace(html, @"<script\b[^>]*>[\s\S]*?</script>", "", RegexOptions.IgnoreCase);
        return Regex.Matches(html, "<[^>]*\\bid=\"Probe\"[^>]*>").Select(match => match.Value).ToArray();
    }
    public static IEnumerable<object[]> Cases()
    {
        foreach (var control in new[] { "Button", "IOField", "TextBox" }) foreach (var enabled in new[] { true, false }) foreach (var mode in new[] { "literal", "invalid", "null", "tag", "malformed" }) yield return [control, enabled, mode];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task CommonColorsUseScopedInterfaceValues(string control, bool enabled, string mode)
    {
        HmiPaintedScreenItemBase item = control switch { "Button" => new HmiButton(), "IOField" => new HmiIOField(), _ => new HmiTextBox() };
        item.Enabled = enabled; item.UseDisabledForegroundColor = true;
        foreach (var property in new[] { "ForegroundColor", "BackgroundColor", "BorderColor", "DisabledForegroundColor", "DisabledForegroundShadowColor" }) item.GetType().GetProperty(property)!.SetValue(item, Bound(property));
        var (root, _, project) = Setup(item, mode); var html = (await Openings(root, project))[0]; var literal = mode == "literal";
        StringAssert.Contains(html, "color: " + (literal ? enabled ? "#010203" : "#0A0B0C" : "#111213") + ";");
        StringAssert.Contains(html, "background-color: " + (literal ? "#040506" : "#111213") + ";");
        StringAssert.Contains(html, "border-color: " + (literal ? "#070809" : "#111213") + ";");
        Assert.AreEqual(!enabled, html.Contains("text-shadow:"));
        if (!enabled) StringAssert.Contains(html, "text-shadow: 1px 1px " + (literal ? "#0D0E0F" : "#111213") + ";");
        Assert.AreEqual(Fallback, item.ForegroundColor!.StaticValue);
    }
    [TestMethod]
    [DataRow(false)]
    [DataRow(true)]
    public async Task TextLineColorResolvesIntoBorderAndCenteredOutline(bool framed)
    {
        var item = new HmiText { Text = HmiMultilingualText.FromText("Caption"), LineColor = Bound("LineColor"), LineWidth = 4 };
        if (framed) item.DrawStrokeInsideFrame = false;
        var (root, _, project) = Setup(item); var html = (await Openings(root, project))[0]; StringAssert.Contains(html, "border-color: #101112;");
        Assert.AreEqual(framed, html.Contains("outline-color: #101112;"));
    }
    [TestMethod]
    [DataRow(false)]
    [DataRow(true)]
    public async Task BarBackgroundAndExplicitTrackResolveIndependently(bool explicitTrack)
    {
        var item = new HmiBar { ShowScale = true, BackgroundColor = Bound("BackgroundColor") }; if (explicitTrack) item.TrackColor = Bound("TrackColor");
        var (root, _, project) = Setup(item); var html = (await Openings(root, project))[0]; StringAssert.Contains(html, "--hmi-bar-track-background: #040506;");
        Assert.AreEqual(explicitTrack, html.Contains("--hmi-bar-track-background: #131415 !important;"));
    }
    [TestMethod]
    public async Task CommonBlinkBranchesRetainOffAndOnSnapshots()
    {
        var item = new HmiButton { ForegroundColor = HmiProperty.Blink(Colors["ForegroundColor"], Fallback), BackgroundColor = HmiProperty.Blink(Colors["BackgroundColor"], Fallback), BorderColor = HmiProperty.Blink(Colors["BorderColor"], Fallback) };
        var (root, _, project) = Setup(item); var html = (await Openings(root, project))[0];
        foreach (var (name, css) in new[] { ("foreground", "#010203"), ("background", "#040506"), ("border", "#070809") })
        {
            StringAssert.Contains(html, "--hmi-" + name + "-color-off: " + css + ";"); StringAssert.Contains(html, "--hmi-" + name + "-color-on: #111213;"); StringAssert.Contains(html, "hmi-" + name + "-color-flash");
        }
    }
    [TestMethod]
    public async Task RepeatedInstancesKeepCommonColorsScoped()
    {
        var item = new HmiIOField { BackgroundColor = Bound("BackgroundColor") }; var (root, rootLayer, project) = Setup(item);
        foreach (var values in new HmiFaceplateInterfaceValue[][] { [new() { Name = "BackgroundColor", Value = Fallback }], [] })
        {
            var other = new HmiFaceplateContainer { FaceplateId = "type" }; foreach (var value in values) other.InterfaceValues.Add(value); rootLayer.Items.Add(other);
        }
        var html = await Openings(root, project); Assert.AreEqual(3, html.Length); StringAssert.Contains(html[0], "background-color: #040506;");
        foreach (var other in html.Skip(1)) StringAssert.Contains(other, "background-color: #111213;"); Assert.AreEqual(Fallback, item.BackgroundColor!.StaticValue);
    }
}
