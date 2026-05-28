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

    private sealed class FakeProject : IHmiProject
    {
        private readonly Dictionary<string, HmiScreen> _screens;

        public FakeProject(params HmiScreen[] screens)
        {
            _screens = screens.ToDictionary(screen => screen.Id ?? screen.Name ?? string.Empty);
        }

        public HmiProjectInfo Info { get; } = new HmiProjectInfo();

        public ValueTask<IReadOnlyList<HmiScreenDescriptor>> GetScreensAsync(CancellationToken cancellationToken = default)
        {
            IReadOnlyList<HmiScreenDescriptor> descriptors = _screens.Values
                .Select(screen => new HmiScreenDescriptor { Id = screen.Id, Name = screen.Name })
                .ToList();
            return new ValueTask<IReadOnlyList<HmiScreenDescriptor>>(descriptors);
        }

        public ValueTask<HmiScreen?> GetScreenAsync(string screenId, CancellationToken cancellationToken = default)
        {
            _screens.TryGetValue(screenId, out var screen);
            return new ValueTask<HmiScreen?>(screen);
        }
    }
}
