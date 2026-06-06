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
            Style =
            {
                BackgroundColor = HmiColor.FromArgb(255, 10, 20, 30),
                ForegroundColor = HmiColor.FromArgb(255, 250, 250, 250),
                BorderWidth = 2
            }
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
            Style =
            {
                LineColor = HmiColor.FromArgb(255, 255, 0, 0),
                LineWidth = 3
            }
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
            Style =
            {
                BackgroundColor = HmiColor.FromArgb(255, 0, 128, 255),
                BorderColor = HmiColor.FromArgb(255, 0, 0, 0)
            }
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
        private readonly Dictionary<string, HmiScreen> _screens;

        public FakeProject(params HmiScreen[] screens)
        {
            _screens = screens.ToDictionary(screen => screen.Id ?? screen.Name ?? string.Empty);
        }

        public override ValueTask<IReadOnlyList<HmiScreenDescriptor>> GetScreensAsync(CancellationToken cancellationToken = default)
        {
            IReadOnlyList<HmiScreenDescriptor> descriptors = _screens.Values
                .Select(screen => new HmiScreenDescriptor { Id = screen.Id, Name = screen.Name })
                .ToList();
            return new ValueTask<IReadOnlyList<HmiScreenDescriptor>>(descriptors);
        }

        public override ValueTask<HmiScreen?> GetScreenAsync(string screenId, CancellationToken cancellationToken = default)
        {
            _screens.TryGetValue(screenId, out var screen);
            return new ValueTask<HmiScreen?>(screen);
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
