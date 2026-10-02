using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiRecursiveScreenTests
{
    [TestMethod]
    public async Task SelfReferencingFaceplatePreservesContainerAndRemainingItems()
    {
        var faceplate = Faceplate("self", "Pump");
        faceplate.Layers[0].Items.Add(new HmiFaceplateContainer { Name = "RecursiveContainer", FaceplateId = "self" });
        AddLabel(faceplate, "Remaining content");

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(faceplate, new TestProject(faceplate));

        StringAssert.Contains(html, "id=\"RecursiveContainer\"");
        StringAssert.Contains(html, "data-hmi-recursive-screen=\"self\"");
        StringAssert.Contains(html, "Remaining content");
        Assert.AreEqual(1, Count(html, "data-hmi-recursive-screen="));
    }

    [TestMethod]
    public async Task IndirectFaceplateCycleStopsAtAncestor()
    {
        var first = Faceplate("first", "First");
        var second = Faceplate("second", "Second");
        first.Layers[0].Items.Add(new HmiFaceplateContainer { FaceplateId = "second" });
        second.Layers[0].Items.Add(new HmiFaceplateContainer { FaceplateId = "first" });
        AddLabel(second, "Nested content");

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(first, new TestProject(first, second));

        StringAssert.Contains(html, "data-hmi-recursive-screen=\"first\"");
        StringAssert.Contains(html, "Nested content");
        Assert.AreEqual(1, Count(html, "data-hmi-recursive-screen="));
    }

    [TestMethod]
    public async Task CycleThroughScreenWindowAndTemplateStopsAtAncestor()
    {
        var faceplate = Faceplate("faceplate", "Faceplate");
        var windowScreen = new HmiScreen { Id = "window", TemplateId = "template" };
        var template = new HmiScreen { Id = "template" };
        template.Layers.Add(new HmiLayer());
        template.Layers[0].Items.Add(new HmiFaceplateContainer { FaceplateId = "faceplate" });
        faceplate.Layers[0].Items.Add(new HmiScreenWindow { ScreenId = "window" });

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(faceplate, new TestProject(faceplate, windowScreen, template));

        StringAssert.Contains(html, "data-hmi-recursive-screen=\"faceplate\"");
        Assert.AreEqual(1, Count(html, "data-hmi-recursive-screen="));
    }

    [TestMethod]
    public async Task ScreenWindowSelfReferenceAlsoStopsAtAncestor()
    {
        var screen = new HmiScreen { Id = "self" };
        screen.Layers.Add(new HmiLayer());
        screen.Layers[0].Items.Add(new HmiScreenWindow { ScreenId = "self" });

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, new TestProject(screen));

        StringAssert.Contains(html, "data-hmi-recursive-screen=\"self\"");
    }

    [TestMethod]
    public async Task RepeatedSiblingInstancesAndDifferentVersionsAreRendered()
    {
        var parent = Faceplate("parent", "Pump");
        var child = Faceplate("child", "Pump");
        child.Version = "2.0";
        AddLabel(child, "Child content");
        parent.Layers[0].Items.Add(new HmiFaceplateContainer { FaceplateId = "child" });
        parent.Layers[0].Items.Add(new HmiFaceplateContainer { FaceplateName = "Pump", FaceplateVersion = "2.0" });
        var project = new TestProject(parent, child);
        var converter = new HmiScreenToHtmlConverter();

        var results = await Task.WhenAll(
            converter.ConvertAsync(parent, project).AsTask(),
            converter.ConvertAsync(parent, project).AsTask());

        foreach (var html in results)
        {
            Assert.AreEqual(2, Count(html, "Child content"));
            Assert.AreEqual(0, Count(html, "data-hmi-recursive-screen="));
        }
    }

    [TestMethod]
    public async Task IdCycleIsDetectedWhenProjectReturnsFreshModels()
    {
        var faceplate = Faceplate("self", "Pump");
        faceplate.Layers[0].Items.Add(new HmiFaceplateContainer { FaceplateId = "self" });
        var project = new TestProject(faceplate) { CloneFaceplates = true };

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(faceplate, project);

        StringAssert.Contains(html, "data-hmi-recursive-screen=\"self\"");
    }

    [TestMethod]
    public async Task AnonymousObjectCycleAndPlaceholderEscapingAreHandled()
    {
        var faceplate = Faceplate(null, null);
        faceplate.Layers[0].Items.Add(new HmiFaceplateContainer { FaceplateId = "anonymous" });
        var project = new TestProject(faceplate);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(faceplate, project);
        StringAssert.Contains(html, "data-hmi-recursive-screen=\"anonymous\"");

        faceplate.Id = "self";
        faceplate.Name = "<Pump>&";
        faceplate.Layers[0].Items.Clear();
        faceplate.Layers[0].Items.Add(new HmiFaceplateContainer { FaceplateId = "self" });
        html = await new HmiScreenToHtmlConverter().ConvertAsync(faceplate, new TestProject(faceplate),
            new HmiHtmlConvertOptions { MissingScreenPlaceholderCssClass = "custom-placeholder" });
        StringAssert.Contains(html, "class=\"custom-placeholder\"");
        StringAssert.Contains(html, "Recursive screen reference: &lt;Pump&gt;&amp;");
    }

    private static HmiFaceplateType Faceplate(string? id, string? name)
    {
        var faceplate = new HmiFaceplateType { Id = id, Name = name, Version = "1.0" };
        faceplate.Layers.Add(new HmiLayer());
        return faceplate;
    }

    private static void AddLabel(HmiScreenBase screen, string text) =>
        screen.Layers[0].Items.Add(new HmiLabel { Text = HmiMultilingualText.FromText(text) });

    private static int Count(string html, string text) => html.Split(text, StringSplitOptions.None).Length - 1;

    private sealed class TestProject(params HmiScreenBase[] screens) : HmiProjectBase
    {
        private int _resolutions;
        public bool CloneFaceplates { get; init; }

        private void CheckResolutionLimit()
        {
            // Bound regressions so a missing cycle guard fails the test without crashing the test host.
            Assert.IsLessThan(20, Interlocked.Increment(ref _resolutions));
        }

        public override ValueTask<HmiScreenBase?> GetScreenAsync(string id, CancellationToken cancellationToken = default)
        {
            CheckResolutionLimit();
            return new(screens.FirstOrDefault(screen => screen.Id == id));
        }

        public override ValueTask<HmiFaceplateType?> GetFaceplateAsync(string id, CancellationToken cancellationToken = default)
        {
            CheckResolutionLimit();
            var faceplate = screens.OfType<HmiFaceplateType>().FirstOrDefault(screen => (screen.Id ?? "anonymous") == id);
            if (CloneFaceplates && faceplate != null)
            {
                var clone = Faceplate(faceplate.Id, faceplate.Name);
                clone.Layers[0].Items.Add(new HmiFaceplateContainer { FaceplateId = id });
                faceplate = clone;
            }
            return new(faceplate);
        }

        public override ValueTask<HmiFaceplateType?> GetFaceplateAsync(string name, string version, CancellationToken cancellationToken = default)
        {
            CheckResolutionLimit();
            return new(screens.OfType<HmiFaceplateType>().FirstOrDefault(screen => screen.Name == name && screen.Version == version));
        }
    }
}
