using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiScreenToHtmlConverterTests
{
    [TestMethod]
    public async Task ConvertAsync_RendersBasicScreenItems()
    {
        var screen = new HmiScreen
        {
            Id = "main",
            Name = "MainScreen",
            Width = 320,
            Height = 240
        };

        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(new HmiButton
        {
            Id = "button-1",
            Name = "StartButton",
            Text = "Start",
            X = 10,
            Y = 20,
            Width = 80,
            Height = 30,
            BackgroundColor = HmiColor.FromArgb(255, 10, 20, 30),
            ForegroundColor = HmiColor.FromArgb(255, 250, 250, 250),
            BorderWidth = 2
        });
        layer.Items.Add(new HmiText
        {
            Id = "text-1",
            Name = "TitleText",
            Text = "Hello <HMI>",
            X = 5,
            Y = 60,
            Width = 100,
            Height = 20
        });
        layer.Items.Add(new HmiGraphicView
        {
            Id = "image-1",
            Name = "Logo",
            X = 120,
            Y = 10,
            Width = 64,
            Height = 64,
            Image = new HmiImageSource
            {
                Kind = HmiImageSourceKind.DataUri,
                Uri = "data:image/png;base64,abc"
            }
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"MainScreen\"");
        StringAssert.Contains(html, "width: 320px;");
        StringAssert.Contains(html, "<button id=\"StartButton\"");
        StringAssert.Contains(html, "Start</button>");
        StringAssert.Contains(html, "background-color: #0A141E;");
        StringAssert.Contains(html, "Hello &lt;HMI&gt;");
        StringAssert.Contains(html, "<img id=\"Logo\"");
        StringAssert.Contains(html, "src=\"data:image/png;base64,abc\"");
    }

    [TestMethod]
    public async Task ConvertAsync_DisablesPointerEventsForEmptyLayers()
    {
        var screen = new HmiScreen
        {
            Id = "screen",
            Name = "Screen",
            Width = 320,
            Height = 240
        };
        screen.Layers.Add(new HmiLayer { Id = "empty-layer", Name = "EmptyLayer" });

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"EmptyLayer\" style=\"position: absolute; inset: 0; pointer-events: none;\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersScreenAbsoluteGroupChildrenAtSourcePosition()
    {
        var screen = new HmiScreen
        {
            Id = "screen",
            Name = "Screen",
            Width = 320,
            Height = 240
        };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        var group = new HmiGroup
        {
            Id = "group-1",
            Name = "PumpGroup",
            X = 100,
            Y = 50,
            Width = 80,
            Height = 40,
            ChildCoordinateSpace = HmiChildCoordinateSpace.ScreenAbsolute
        };
        group.Items.Add(new HmiLabel
        {
            Id = "label-1",
            Name = "PumpLabel",
            Text = "Pump",
            X = 110,
            Y = 70,
            Width = 40,
            Height = 20
        });
        layer.Items.Add(group);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"PumpGroup\" style=\"position: absolute;left: 100px;top: 50px;width: 80px;height: 40px;\"");
        StringAssert.Contains(html, "<div style=\"position: absolute;left: -100px;top: -50px;\">");
        StringAssert.Contains(html, "id=\"PumpLabel\" style=\"position: absolute;left: 110px;top: 70px;width: 40px;height: 20px;\"");
    }

    [TestMethod]
    public async Task ConvertAsync_UsesScreenBackgroundColorOnRootElement()
    {
        var screen = new HmiScreen
        {
            Id = "screen",
            Name = "Screen",
            Width = 320,
            Height = 240,
            BackgroundColor = HmiColor.FromArgb(255, 17, 34, 51)
        };

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"Screen\" style=\"position: relative; overflow: hidden;width: 320px;height: 240px;background-color: #112233;\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersTemplateBeforeScreenItemsById()
    {
        var main = new HmiScreen
        {
            Id = "main",
            Name = "Main",
            TemplateId = "template-id"
        };
        var mainLayer = new HmiLayer { Id = "main-layer", Name = "MainLayer" };
        mainLayer.Items.Add(new HmiLabel { Id = "main-label", Name = "MainLabel", Text = "Screen item" });
        main.Layers.Add(mainLayer);

        var template = new HmiScreenMaster
        {
            Id = "template-id",
            Name = "Template"
        };
        var templateLayer = new HmiLayer { Id = "template-layer", Name = "TemplateLayer" };
        templateLayer.Items.Add(new HmiLabel { Id = "template-label", Name = "TemplateLabel", Text = "Template item" });
        template.Layers.Add(templateLayer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(main, new FakeProject(template));

        StringAssert.Contains(html, "Template item");
        StringAssert.Contains(html, "Screen item");
        Assert.IsLessThan(html.IndexOf("Screen item", StringComparison.Ordinal), html.IndexOf("Template item", StringComparison.Ordinal));
        Assert.AreEqual(1, CountOccurrences(html, "<script type=\"module\">"));
        Assert.AreEqual(1, CountOccurrences(html, "<meta charset=\"utf-8\">"));
    }

    [TestMethod]
    public async Task ConvertAsync_ResolvesTemplateByName()
    {
        var main = new HmiScreen
        {
            Id = "main",
            Name = "Main",
            TemplateName = "TemplateByName"
        };

        var template = new HmiScreenMaster
        {
            Id = "template-id",
            Name = "TemplateByName"
        };
        var templateLayer = new HmiLayer { Id = "template-layer", Name = "TemplateLayer" };
        templateLayer.Items.Add(new HmiLabel { Id = "template-label", Name = "TemplateLabel", Text = "Named template item" });
        template.Layers.Add(templateLayer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(main, new FakeProject(template));

        StringAssert.Contains(html, "Named template item");
    }

    [TestMethod]
    public async Task ConvertAsync_ResolvesScreenWindowThroughProject()
    {
        var main = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiScreenWindow
        {
            Id = "window-1",
            Name = "DetailWindow",
            ScreenId = "detail",
            ScreenName = "Detail",
            Width = 200,
            Height = 100
        });
        main.Layers.Add(layer);

        var detail = new HmiScreen { Id = "detail", Name = "Detail" };
        var detailLayer = new HmiLayer { Id = "detail-layer", Name = "DetailLayer" };
        detailLayer.Items.Add(new HmiLabel { Id = "label-1", Name = "DetailLabel", Text = "Loaded lazily" });
        detail.Layers.Add(detailLayer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(main, new FakeProject(detail));

        StringAssert.Contains(html, "id=\"DetailWindow\"");
        StringAssert.Contains(html, "Loaded lazily");
        Assert.AreEqual(1, CountOccurrences(html, "<script type=\"module\">"));
        Assert.AreEqual(1, CountOccurrences(html, "<meta charset=\"utf-8\">"));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersPlaceholderForMissingScreenWindowTarget()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiScreenWindow
        {
            Id = "window-1",
            Name = "DetailWindow",
            ScreenId = "missing",
            ScreenName = "MissingDetail"
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, new FakeProject());

        StringAssert.Contains(html, "hmi-missing-screen");
        StringAssert.Contains(html, "MissingDetail");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersVectorShapesAsSvg()
    {
        var screen = new HmiScreen
        {
            Id = "main",
            Name = "Main",
            Width = 300,
            Height = 200
        };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiLine
        {
            Id = "line-1",
            Name = "PipeLine",
            Width = 100,
            Height = 40,
            X2 = 100,
            Y2 = 40,
            LineColor = HmiColor.FromArgb(255, 255, 0, 0),
            LineWidth = 3
        });
        var polyline = new HmiPolyline
        {
            Id = "polyline-1",
            Name = "TrendLine",
            Width = 120,
            Height = 50
        };
        polyline.Points.Add(new HmiPoint(0, 50));
        polyline.Points.Add(new HmiPoint(40, 10));
        polyline.Points.Add(new HmiPoint(120, 30));
        layer.Items.Add(polyline);
        var polygon = new HmiPolygon
        {
            Id = "polygon-1",
            Name = "TankShape",
            Width = 90,
            Height = 90,
            BackgroundColor = HmiColor.FromArgb(255, 0, 128, 255),
            BorderColor = HmiColor.FromArgb(255, 0, 0, 0)
        };
        polygon.Points.Add(new HmiPoint(45, 0));
        polygon.Points.Add(new HmiPoint(90, 90));
        polygon.Points.Add(new HmiPoint(0, 90));
        layer.Items.Add(polygon);
        layer.Items.Add(new HmiCircle
        {
            Id = "circle-1",
            Name = "StatusLamp",
            Width = 40,
            Height = 40,
            Radius = 18,
            CenterX = 20,
            CenterY = 20
        });
        layer.Items.Add(new HmiCircularArc
        {
            Id = "arc-1",
            Name = "GaugeArc",
            Width = 80,
            Height = 80,
            Radius = 30,
            CenterX = 40,
            CenterY = 40,
            StartAngle = 180,
            SweepAngle = 90
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<svg id=\"PipeLine\"");
        StringAssert.Contains(html, "<line");
        StringAssert.Contains(html, "stroke=\"#FF0000\"");
        StringAssert.Contains(html, "stroke-width=\"3\"");
        StringAssert.Contains(html, "<polyline");
        StringAssert.Contains(html, "points=\"0,50 40,10 120,30\"");
        StringAssert.Contains(html, "<polygon");
        StringAssert.Contains(html, "fill=\"#0080FF\"");
        StringAssert.Contains(html, "<circle");
        StringAssert.Contains(html, "r=\"18\"");
        StringAssert.Contains(html, "<path");
        StringAssert.Contains(html, "A 30 30 0 0 1");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersRectangleWithDefaultBorder()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiRectangle
        {
            Id = "rect-1",
            Name = "Frame",
            Width = 100,
            Height = 50
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"Frame\"");
        StringAssert.Contains(html, "border: 1px solid #000000;");
    }

    [TestMethod]
    public async Task ConvertAsync_IncludesInlineHtmlRuntimeModule()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<script type=\"module\">");
        StringAssert.Contains(html, "customElements.define(\"node-projects-svghmi\"");
        Assert.AreEqual(1, CountOccurrences(html, "<script type=\"module\">"));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersDynamicSvgAsSvgHmiWebComponent()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        var dynamicSvg = new HmiDynamicSvg
        {
            Id = "symbol-1",
            Name = "Valve",
            Width = 32,
            Height = 32,
            Image = new HmiImageSource
            {
                Kind = HmiImageSourceKind.Uri,
                Uri = "symbols/valve.svghmi"
            }
        };
        dynamicSvg.Properties.Add(new HmiDynamicSvgProperty { Name = "FillColor", Value = HmiColor.FromArgb(255, 0, 128, 255) });
        dynamicSvg.Properties.Add(new HmiDynamicSvgProperty { Name = "ShowCaption", Value = true });
        layer.Items.Add(dynamicSvg);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<script type=\"module\">");
        StringAssert.Contains(html, "<node-projects-svghmi id=\"Valve\"");
        StringAssert.Contains(html, "src=\"symbols/valve.svghmi\"");
        StringAssert.Contains(html, "fill-color=\"#0080FF\"");
        StringAssert.Contains(html, "show-caption=\"true\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersGaugeAsGaugeWebComponent()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiGauge
        {
            Id = "gauge-1",
            Name = "SpeedGauge",
            X = 10,
            Y = 20,
            Width = 160,
            Height = 120,
            Value = 20,
            FillLevel = 25,
            ShowFillLevel = true,
            BeginValue = 0,
            EndValue = 50,
            OriginValue = 0,
            DivisionCount = 5,
            SubDivisionCount = 5,
            ShowValue = true,
            LabelColor = HmiColor.FromArgb(255, 32, 36, 42),
            ScaleBackgroundColor = HmiColor.FromArgb(255, 111, 113, 121),
            ScaleForegroundColor = HmiColor.FromArgb(255, 134, 189, 40),
            TickColor = HmiColor.FromArgb(255, 111, 113, 121),
            LabelFont = new HmiFont
            {
                Name = "Arial",
                Size = 8,
                Bold = true
            }
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<hmi-gauge id=\"SpeedGauge\"");
        StringAssert.Contains(html, "left: 10px;");
        StringAssert.Contains(html, "value=\"20\"");
        StringAssert.Contains(html, "fill-level=\"25\"");
        StringAssert.Contains(html, " show-fill-level ");
        StringAssert.Contains(html, "begin-value=\"0\"");
        StringAssert.Contains(html, "end-value=\"50\"");
        StringAssert.Contains(html, "division-count=\"5\"");
        StringAssert.Contains(html, "sub-division-count=\"5\"");
        StringAssert.Contains(html, " show-value ");
        StringAssert.Contains(html, "label-color=\"#20242A\"");
        StringAssert.Contains(html, "scale-background-color=\"#6F7179\"");
        StringAssert.Contains(html, "scale-foreground-color=\"#86BD28\"");
        StringAssert.Contains(html, "tick-color=\"#6F7179\"");
        StringAssert.Contains(html, "label-font=\"{&quot;name&quot;:&quot;Arial&quot;,&quot;size&quot;:8,&quot;bold&quot;:true}\"");
        StringAssert.Contains(html, "</hmi-gauge>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersStaticSvgImagesAsPlainImages()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiGraphicView
        {
            Id = "logo-1",
            Name = "Logo",
            Width = 32,
            Height = 32,
            Image = new HmiImageSource
            {
                Kind = HmiImageSourceKind.Uri,
                Uri = "symbols/logo.svg"
            }
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<img id=\"Logo\"");
        StringAssert.Contains(html, "src=\"symbols/logo.svg\"");
        Assert.IsFalse(html.Contains("<node-projects-svghmi", StringComparison.Ordinal));
    }

    private sealed class FakeProject : HmiProjectBase
    {
        private readonly Dictionary<string, HmiScreenBase> _screens = new(StringComparer.Ordinal);

        public FakeProject(params HmiScreenBase[] screens)
        {
            foreach (var screen in screens)
            {
                if (!string.IsNullOrWhiteSpace(screen.Id))
                    _screens[screen.Id!] = screen;
                if (!string.IsNullOrWhiteSpace(screen.Name))
                    _screens[screen.Name!] = screen;
            }
        }

        public override ValueTask<IReadOnlyList<HmiScreenDescriptor>> GetScreensAsync(CancellationToken cancellationToken = default)
        {
            IReadOnlyList<HmiScreenDescriptor> descriptors = _screens.Values
                .Select(screen => new HmiScreenDescriptor { Id = screen.Id ?? string.Empty, Name = screen.Name ?? string.Empty })
                .ToList();
            return new ValueTask<IReadOnlyList<HmiScreenDescriptor>>(descriptors);
        }

        public override ValueTask<HmiScreenBase?> GetScreenAsync(string screenId, CancellationToken cancellationToken = default)
        {
            _screens.TryGetValue(screenId, out var screen);
            return new ValueTask<HmiScreenBase?>(screen);
        }
    }

    private static int CountOccurrences(string value, string search)
    {
        var count = 0;
        var index = 0;
        while ((index = value.IndexOf(search, index, StringComparison.Ordinal)) >= 0)
        {
            count++;
            index += search.Length;
        }

        return count;
    }
}
