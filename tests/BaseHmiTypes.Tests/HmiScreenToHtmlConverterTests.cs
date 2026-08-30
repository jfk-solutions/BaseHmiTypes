using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Images;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Defaults;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiScreenToHtmlConverterTests
{
    [TestMethod]
    public async Task ConvertAsync_RendersSymbolicIoFieldStates()
    {
        var symbolicIoField = new HmiSymbolicIOField
        {
            Name = "MotorState",
            X = 10,
            Y = 20,
            Width = 120,
            Height = 30,
            Value = 2
        };
        symbolicIoField.States.Add(new HmiState { Name = "Stopped", Value = 0, Text = HmiMultilingualText.FromText("Stopped") });
        symbolicIoField.States.Add(new HmiState { Name = "Running", Value = 2, Text = HmiMultilingualText.FromText("Running") });
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(symbolicIoField);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<select id=\"MotorState\"");
        StringAssert.Contains(html, "<option value=\"0\">Stopped</option>");
        StringAssert.Contains(html, "<option value=\"2\" selected=\"selected\">Running</option>");
        Assert.IsFalse(html.Contains("HmiSymbolicIOField", StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersMaterializedReferenceObject()
    {
        var materialized = new HmiGroup { Name = "PumpFaceplate", X = 5, Y = 6, Width = 100, Height = 50 };
        materialized.Items.Add(new HmiRectangle { Name = "PumpBody", X = 7, Y = 8, Width = 80, Height = 30 });
        var reference = new HmiGroup
        {
            Name = "Pump101",
            X = 10,
            Y = 20,
            Width = 100,
            Height = 50,
            IsReferenceObject = true,
            ReferenceObject = new HmiReferenceObjectSettings
            {
                Source = "Pumps.PumpFaceplate",
                MaterializedObject = materialized
            }
        };
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(reference);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "class=\"hmi-reference-object\"");
        StringAssert.Contains(html, "data-hmi-reference-source=\"Pumps.PumpFaceplate\"");
        StringAssert.Contains(html, "id=\"Pump101\"");
        StringAssert.Contains(html, "id=\"PumpFaceplate\"");
        StringAssert.Contains(html, "id=\"PumpBody\"");
    }

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
            Text = HmiMultilingualText.FromText("Start"),
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
            Text = HmiMultilingualText.FromText("Hello <HMI>"),
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
    public async Task ConvertAsync_UsesFormattedTextBodyForSelectedCulture()
    {
        var screen = new HmiScreen
        {
            Name = "Main",
            Width = 320,
            Height = 240
        };
        var layer = new HmiLayer { Name = "Layer0" };
        screen.Layers.Add(layer);
        layer.Items.Add(new HmiText
        {
            Name = "TitleText",
            Text = new HmiMultilingualText
            {
                Texts = { [1033] = "Initialize parameter", [1031] = "Parameter initialisieren" },
                FormattedTexts =
                {
                    [1031] = "<?xml version=\"1.0\" encoding=\"utf-8\"?><ProjectText xmlns=\"http://www.siemens.com/Industry/2009/10/01/Automation/FormattedText\"><body><p>Parameter<br />initialisieren</p></body></ProjectText>"
                }
            }
        });

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(
            screen,
            options: new HmiHtmlConvertOptions { CultureLcid = 1031 });

        StringAssert.Contains(html, "<p>Parameter<br />initialisieren</p>");
        Assert.IsFalse(html.Contains("<body>"));
        Assert.IsFalse(html.Contains("ProjectText"));
        Assert.IsFalse(html.Contains("xmlns="));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersToggleSwitchComponent()
    {
        var screen = new HmiScreen
        {
            Id = "main",
            Name = "MainScreen",
            Width = 320,
            Height = 240
        };

        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(new HmiToggleSwitch
        {
            Id = "toggle-1",
            Name = "ModeSwitch",
            X = 10,
            Y = 20,
            Width = 120,
            Height = 52,
            Mode = HmiSwitchType.Switch,
            Header = true,
            HeaderText = HmiMultilingualText.FromText("LabelText"),
            Text = HmiMultilingualText.FromText("OFF"),
            AlternateText = HmiMultilingualText.FromText("ON"),
            Image = new HmiImageSource { Uri = "off.svg" },
            AlternateImage = new HmiImageSource { Uri = "on.svg" }
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<hmi-toggle-switch");
        StringAssert.Contains(html, "id=\"ModeSwitch\"");
        StringAssert.Contains(html, "mode=\"Switch\"");
        StringAssert.Contains(html, "text=\"OFF\"");
        StringAssert.Contains(html, "alternate-text=\"ON\"");
        StringAssert.Contains(html, "image=\"off.svg\"");
        StringAssert.Contains(html, "alternate-image=\"on.svg\"");
        StringAssert.Contains(html, " header");
        StringAssert.Contains(html, "header-text=\"LabelText\"");
        StringAssert.Contains(html, "</hmi-toggle-switch>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersFormattedToggleSwitchTextAttributes()
    {
        var screen = new HmiScreen
        {
            Id = "main",
            Name = "MainScreen",
            Width = 320,
            Height = 240
        };

        var formattedText = "<?xml version=\"1.0\" encoding=\"utf-8\"?><ProjectText xmlns=\"http://www.siemens.com/Industry/2009/10/01/Automation/FormattedText\"><body><p>Parameter<br />initialisieren</p></body></ProjectText>";
        var text = new HmiMultilingualText
        {
            Texts = { [1031] = "Parameter initialisieren" },
            FormattedTexts = { [1031] = formattedText }
        };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(new HmiToggleSwitch
        {
            Id = "toggle-1",
            Name = "ModeSwitch",
            Header = true,
            HeaderText = text,
            Text = text,
            AlternateText = text
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(
            screen,
            options: new HmiHtmlConvertOptions { CultureLcid = 1031 });

        StringAssert.Contains(html, "text=\"&lt;p&gt;Parameter&lt;br /&gt;initialisieren&lt;/p&gt;\"");
        StringAssert.Contains(html, "alternate-text=\"&lt;p&gt;Parameter&lt;br /&gt;initialisieren&lt;/p&gt;\"");
        StringAssert.Contains(html, "header-text=\"&lt;p&gt;Parameter&lt;br /&gt;initialisieren&lt;/p&gt;\"");
        Assert.IsFalse(html.Contains("ProjectText"));
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
            Text = HmiMultilingualText.FromText("Pump"),
            X = 110,
            Y = 70,
            Width = 40,
            Height = 20
        });
        layer.Items.Add(group);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"PumpGroup\" style=\"position: absolute;left: 100px;top: 50px;width: 80px;height: 40px;\"");
        Assert.IsFalse(html.Contains("left: -100px;top: -50px;", StringComparison.Ordinal));
        StringAssert.Contains(html, "id=\"PumpLabel\" style=\"position: absolute;left: 10px;top: 20px;width: 40px;height: 20px;");
    }

    [TestMethod]
    public async Task ConvertAsync_FlattensLogicOnlyGroupsWithoutAdjustingChildCoordinates()
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
            ChildCoordinateSpace = HmiChildCoordinateSpace.ScreenAbsolute,
            IsLogicGrouping = true
        };
        group.Items.Add(new HmiLabel
        {
            Id = "label-1",
            Name = "PumpLabel",
            Text = HmiMultilingualText.FromText("Pump"),
            X = 110,
            Y = 70,
            Width = 40,
            Height = 20
        });
        layer.Items.Add(group);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        Assert.IsFalse(html.Contains("id=\"PumpGroup\"", StringComparison.Ordinal));
        StringAssert.Contains(html, "id=\"PumpLabel\" style=\"position: absolute;left: 110px;top: 70px;width: 40px;height: 20px;");
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
        mainLayer.Items.Add(new HmiLabel { Id = "main-label", Name = "MainLabel", Text = HmiMultilingualText.FromText("Screen item") });
        main.Layers.Add(mainLayer);

        var template = new HmiScreenMaster
        {
            Id = "template-id",
            Name = "Template"
        };
        var templateLayer = new HmiLayer { Id = "template-layer", Name = "TemplateLayer" };
        templateLayer.Items.Add(new HmiLabel { Id = "template-label", Name = "TemplateLabel", Text = HmiMultilingualText.FromText("Template item") });
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
        templateLayer.Items.Add(new HmiLabel { Id = "template-label", Name = "TemplateLabel", Text = HmiMultilingualText.FromText("Named template item") });
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
        detailLayer.Items.Add(new HmiLabel { Id = "label-1", Name = "DetailLabel", Text = HmiMultilingualText.FromText("Loaded lazily") });
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
    public async Task ConvertAsync_RendersScreenAbsolutePolygonPointsAsLocalSvgPoints()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        var polygon = new HmiPolygon
        {
            Id = "polygon-1",
            Name = "PumpShape",
            X = 100,
            Y = 50,
            Width = 60,
            Height = 40,
            PointCoordinateSpace = HmiPointCoordinateSpace.ScreenAbsolute,
            BackgroundColor = HmiColor.FromArgb(255, 0, 128, 255)
        };
        polygon.Points.Add(new HmiPoint(100, 50));
        polygon.Points.Add(new HmiPoint(160, 50));
        polygon.Points.Add(new HmiPoint(130, 90));
        layer.Items.Add(polygon);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<svg id=\"PumpShape\" style=\"position: absolute;left: 100px;top: 50px;width: 60px;height: 40px;\" viewBox=\"0 0 60 40\"");
        StringAssert.Contains(html, "<polygon");
        StringAssert.Contains(html, "points=\"0,0 60,0 30,40\"");
        StringAssert.Contains(html, "fill=\"#0080FF\"");
        StringAssert.DoesNotMatch(html, new System.Text.RegularExpressions.Regex("<svg[^>]*background-color"));
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
    public async Task ConvertAsync_RendersPaintedItemPadding()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiText
        {
            Id = "text-1",
            Name = "PaddedText",
            Text = HmiMultilingualText.FromText("Padded"),
            Width = 100,
            Height = 40,
            Padding = new HmiThickness
            {
                Top = 1,
                Right = 2,
                Bottom = 3,
                Left = 4
            }
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"PaddedText\"");
        StringAssert.Contains(html, "padding: 1px 2px 3px 4px;");
    }

    [TestMethod]
    public void AdvancedDefaults_ResolveTextBorderWidthWithoutMaterializingItOnItem()
    {
        var text = new HmiText
        {
            Id = "text-1",
            Name = "TextField"
        };

        var resolver = new HmiEffectivePropertyResolver(HmiDefaultProfiles.WinCcAdvancedV21);
        var resolved = resolver.Resolve(text, nameof(HmiPaintedScreenItemBase.BorderWidth), text.BorderWidth);

        Assert.IsNull(text.BorderWidth);
        Assert.IsNotNull(resolved);
        Assert.AreEqual(HmiPropertyKind.Default, resolved!.Kind);
        Assert.AreEqual(1d, resolved.StaticValue);
    }

    [TestMethod]
    public void DefaultProfile_ResolvesBaseTypeDefaultsByInheritance()
    {
        var profile = new HmiDefaultProfile("TestProfile");
        profile.Set<HmiPaintedScreenItemBase, double>(nameof(HmiPaintedScreenItemBase.BorderWidth), 4d);
        var text = new HmiText
        {
            Id = "text-1",
            Name = "TextField"
        };

        var resolver = new HmiEffectivePropertyResolver(profile);
        var resolved = resolver.Resolve(text, nameof(HmiPaintedScreenItemBase.BorderWidth), text.BorderWidth);

        Assert.IsNotNull(resolved);
        Assert.AreEqual(HmiPropertyKind.Default, resolved!.Kind);
        Assert.AreEqual(4d, resolved.StaticValue);
    }

    [TestMethod]
    public async Task ConvertAsync_WithoutProjectUsesNeutralDefaults()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiText
        {
            Id = "text-1",
            Name = "OccupiedMf12",
            Text = HmiMultilingualText.FromText("Occupied"),
            Width = 80,
            Height = 20
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"OccupiedMf12\"");
        Assert.IsFalse(html.Contains("border-width: 1px;", StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task ConvertAsync_UsesAdvancedTextBorderWidthDefault()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiText
        {
            Id = "text-1",
            Name = "OccupiedMf12",
            Text = HmiMultilingualText.FromText("Occupied"),
            Width = 80,
            Height = 20
        });
        screen.Layers.Add(layer);

        var project = new FakeProject();
        project.Info.HmiProjectSoftwareType = HmiProjectSoftwareType.WinCCAdvanced;

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, project);

        StringAssert.Contains(html, "<div id=\"OccupiedMf12\"");
        StringAssert.Contains(html, "border-style: solid;");
        StringAssert.Contains(html, "border-width: 1px;");
    }

    [TestMethod]
    public async Task ConvertAsync_ExplicitTextBorderWidthOverridesAdvancedDefault()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiText
        {
            Id = "text-1",
            Name = "CommandMf12",
            Text = HmiMultilingualText.FromText("Cmd"),
            Width = 80,
            Height = 20,
            BorderWidth = 2
        });
        screen.Layers.Add(layer);

        var project = new FakeProject();
        project.Info.HmiProjectSoftwareType = HmiProjectSoftwareType.WinCCAdvanced;

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, project);

        StringAssert.Contains(html, "<div id=\"CommandMf12\"");
        StringAssert.Contains(html, "border-width: 2px;");
        Assert.IsFalse(html.Contains("border-width: 1px;", StringComparison.Ordinal));
    }

    [TestMethod]
    public void AdvancedDefaults_ResolveBaseDefaultAndConcreteOverride()
    {
        var shape = new HmiRectangle
        {
            Id = "shape-1",
            Name = "Shape"
        };
        var svg = new HmiDynamicSvg
        {
            Id = "svg-1",
            Name = "Svg"
        };
        var explicitSvg = new HmiDynamicSvg
        {
            Id = "svg-2",
            Name = "ExplicitSvg",
            UseTransparentColor = false
        };

        var resolver = new HmiEffectivePropertyResolver(HmiDefaultProfiles.WinCcAdvancedV21);

        var shapeUseTransparentColor = resolver.Resolve(shape, nameof(HmiShapeBase.UseTransparentColor), shape.UseTransparentColor);
        var svgUseTransparentColor = resolver.Resolve(svg, nameof(HmiDynamicSvg.UseTransparentColor), svg.UseTransparentColor);
        var explicitSvgUseTransparentColor = resolver.Resolve(explicitSvg, nameof(HmiDynamicSvg.UseTransparentColor), explicitSvg.UseTransparentColor);

        Assert.IsFalse(shapeUseTransparentColor!.StaticValue);
        Assert.AreEqual(HmiPropertyKind.Default, shapeUseTransparentColor.Kind);
        Assert.IsTrue(svgUseTransparentColor!.StaticValue);
        Assert.AreEqual(HmiPropertyKind.Default, svgUseTransparentColor.Kind);
        Assert.IsFalse(explicitSvgUseTransparentColor!.StaticValue);
        Assert.AreEqual(HmiPropertyKind.Static, explicitSvgUseTransparentColor.Kind);
    }

    [TestMethod]
    public void AdvancedDefaults_ResolveEnumFallbacksAsIntegers()
    {
        var button = new HmiButton
        {
            Id = "button-1",
            Name = "Button"
        };
        var toggleSwitch = new HmiToggleSwitch
        {
            Id = "toggle-1",
            Name = "Toggle"
        };
        var symbolicIoField = new HmiSymbolicIOField
        {
            Id = "symbolic-1",
            Name = "Symbolic"
        };

        var resolver = new HmiEffectivePropertyResolver(HmiDefaultProfiles.WinCcAdvancedV21);

        var styleSettings = resolver.Resolve(button, nameof(HmiButton.StyleSettings), button.StyleSettings);
        var toggleStyleSettings = resolver.Resolve(toggleSwitch, nameof(HmiToggleSwitch.StyleSettings), toggleSwitch.StyleSettings);
        var toggleMode = resolver.Resolve(toggleSwitch, nameof(HmiToggleSwitch.Mode), toggleSwitch.Mode);
        var mode = resolver.Resolve(symbolicIoField, nameof(HmiSymbolicIOField.Mode), symbolicIoField.Mode);

        Assert.AreEqual(1, styleSettings!.StaticValue);
        Assert.AreEqual(1, toggleStyleSettings!.StaticValue);
        Assert.AreEqual(HmiSwitchType.Switch, toggleMode!.StaticValue);
        Assert.AreEqual(2, mode!.StaticValue);
    }

    [TestMethod]
    public void UnifiedDefaults_ResolveShapeLineColorFromStyleProfile()
    {
        var line = new HmiLine
        {
            Id = "line-1",
            Name = "Line"
        };

        var resolver = new HmiEffectivePropertyResolver(HmiDefaultProfiles.WinCcUnifiedV21);
        var resolved = resolver.Resolve(line, nameof(HmiShapeBase.LineColor), line.LineColor);

        Assert.IsNotNull(resolved);
        Assert.AreEqual(HmiPropertyKind.Default, resolved!.Kind);
        Assert.AreEqual(HmiColor.FromArgb(255, 125, 125, 133), resolved.StaticValue);
    }

    [TestMethod]
    public void UnifiedDefaults_ResolveTextAlignmentFromStyleProfile()
    {
        var text = new HmiText
        {
            Id = "text-1",
            Name = "Text"
        };
        var button = new HmiButton
        {
            Id = "button-1",
            Name = "Button"
        };

        var resolver = new HmiEffectivePropertyResolver(HmiDefaultProfiles.WinCcUnifiedV21);

        var textHorizontal = resolver.Resolve(text, nameof(HmiText.HorizontalAlignment), text.HorizontalAlignment);
        var textVertical = resolver.Resolve(text, nameof(HmiText.VerticalAlignment), text.VerticalAlignment);
        var buttonHorizontal = resolver.Resolve(button, nameof(HmiWidgetBase.HorizontalAlignment), button.HorizontalAlignment);
        var buttonVertical = resolver.Resolve(button, nameof(HmiWidgetBase.VerticalAlignment), button.VerticalAlignment);

        Assert.AreEqual(HmiHorizontalAlignment.Center, textHorizontal!.StaticValue);
        Assert.AreEqual(HmiVerticalAlignment.Center, textVertical!.StaticValue);
        Assert.AreEqual(HmiHorizontalAlignment.Center, buttonHorizontal!.StaticValue);
        Assert.AreEqual(HmiVerticalAlignment.Center, buttonVertical!.StaticValue);
    }

    [TestMethod]
    public async Task ConvertAsync_UsesUnifiedDefaultsFromProjectSoftwareType()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiButton
        {
            Id = "button-1",
            Name = "UnifiedButton",
            Text = HmiMultilingualText.FromText("Button"),
            Width = 80,
            Height = 30
        });
        screen.Layers.Add(layer);

        var project = new FakeProject();
        project.Info.HmiProjectSoftwareType = HmiProjectSoftwareType.WinCCUnified;

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, project);

        StringAssert.Contains(html, "<button id=\"UnifiedButton\"");
        StringAssert.Contains(html, "background-color: #7B92A2;");
        StringAssert.Contains(html, "border-width: 2px;");
        StringAssert.Contains(html, "text-align: center;");
        StringAssert.Contains(html, "justify-content: center;");
        StringAssert.Contains(html, "align-items: center;");
    }

    [TestMethod]
    public async Task ConvertAsync_IncludesInlineHtmlRuntimeModule()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<style>*,*::before,*::after{box-sizing:border-box;}</style>");
        StringAssert.Contains(html, "<script type=\"module\">");
        StringAssert.Contains(html, "customElements.define(\"node-projects-svghmi\"");
        Assert.AreEqual(1, CountOccurrences(html, "<style>*,*::before,*::after{box-sizing:border-box;}</style>"));
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
        StringAssert.Contains(html, "fill-color=\"0xFF0080FF\"");
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
            BackgroundColor = HmiColor.FromArgb(255, 240, 244, 248),
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
        StringAssert.Contains(html, "background-color=\"#F0F4F8\"");
        StringAssert.DoesNotMatch(html, new System.Text.RegularExpressions.Regex("<hmi-gauge[^>]*style=\"[^\"]*background-color:"));
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

    [TestMethod]
    public async Task ConvertAsync_RendersGraphicViewProjectMetafileAsSvgImage()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiGraphicView
        {
            Id = "symbol-1",
            Name = "Symbol",
            Width = 32,
            Height = 32,
            Image = new HmiImageSource
            {
                ImageId = "symbol-image"
            }
        });
        screen.Layers.Add(layer);

        var project = new FakeProject(screen);
        project.AddImage(new HmiImage
        {
            Id = "symbol-image",
            Name = "symbol.emf",
            ImageType = HmiImageType.Emf,
            MimeType = "image/x-emf",
            Data = CreateMinimalEmf()
        });

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, project);

        StringAssert.Contains(html, "<img id=\"Symbol\"");
        StringAssert.Contains(html, "src=\"data:image/svg+xml;charset=utf-8,");
        Assert.IsFalse(html.Contains("data:image/x-emf", StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersButtonProjectImage()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiButton
        {
            Name = "Start",
            Image = new HmiImageSource { ImageId = "start-image" }
        });
        screen.Layers.Add(layer);
        var project = new FakeProject(screen);
        project.AddImage(new HmiImage
        {
            Id = "start-image",
            Name = "start.png",
            ImageType = HmiImageType.Png,
            MimeType = "image/png",
            Data = [1, 2, 3]
        });

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, project);

        StringAssert.Contains(html, "<button id=\"Start\"");
        StringAssert.Contains(html, "<img src=\"data:image/png;base64,AQID\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersSelectedButtonStateCaptionAndProjectImage()
    {
        var button = new HmiButton
        {
            Name = "Motor",
            State = 2,
            Text = HmiMultilingualText.FromText("Default")
        };
        button.States.Add(new HmiState { Value = 0, Text = HmiMultilingualText.FromText("Stopped") });
        button.States.Add(new HmiState
        {
            Value = 2,
            Text = HmiMultilingualText.FromText("Running"),
            Image = new HmiImageSource { ImageId = "running-image" }
        });
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(button);
        screen.Layers.Add(layer);
        var project = new FakeProject(screen);
        project.AddImage(new HmiImage
        {
            Id = "running-image",
            Name = "running.png",
            ImageType = HmiImageType.Png,
            MimeType = "image/png",
            Data = [4, 5, 6]
        });

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, project);

        StringAssert.Contains(html, "<button id=\"Motor\"");
        StringAssert.Contains(html, "<img src=\"data:image/png;base64,BAUG\"");
        StringAssert.Contains(html, "Running</button>");
        Assert.DoesNotContain(">Default</button>", html);
    }

    [TestMethod]
    public async Task ConvertAsync_RendersStaticDisabledButtonAppearance()
    {
        var disabled = new HmiButton
        {
            Name = "Disabled",
            Enabled = false,
            ShowDisabledState = true,
            DisabledImageMode = HmiDisabledImageMode.Reference,
            Image = new HmiImageSource { ImageId = "normal-image" },
            DisabledImage = new HmiImageSource { ImageId = "disabled-image" }
        };
        var grayscale = new HmiButton
        {
            Name = "Grayscale",
            Enabled = false,
            ShowDisabledState = true,
            DisabledImageMode = HmiDisabledImageMode.Grayscale,
            Image = new HmiImageSource { ImageId = "normal-image" }
        };
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(disabled);
        layer.Items.Add(grayscale);
        screen.Layers.Add(layer);
        var project = new FakeProject(screen);
        project.AddImage(new HmiImage
        {
            Id = "normal-image",
            Name = "normal.png",
            ImageType = HmiImageType.Png,
            MimeType = "image/png",
            Data = [1]
        });
        project.AddImage(new HmiImage
        {
            Id = "disabled-image",
            Name = "disabled.png",
            ImageType = HmiImageType.Png,
            MimeType = "image/png",
            Data = [2]
        });

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, project);

        StringAssert.Contains(html, "<button id=\"Disabled\"");
        StringAssert.Contains(html, "disabled=\"disabled\"><img src=\"data:image/png;base64,Ag==\"");
        StringAssert.Contains(html, "<button id=\"Grayscale\"");
        StringAssert.Contains(html, "src=\"data:image/png;base64,AQ==\" style=\"width: 100%; height: 100%; filter: grayscale(1);\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersSymbolLibraryControlMetafileSymbol()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiSymbolLibraryControl
        {
            Id = "library-symbol-1",
            Name = "LibrarySymbol",
            SymbolId = "siemens-symbol",
            Width = 48,
            Height = 48,
            FixedAspectRatio = true,
            Symbol = new HmiImage
            {
                Id = "symbol-image",
                Name = "symbol.wmf",
                ImageType = HmiImageType.Emf,
                Data = CreateMinimalEmf()
            }
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"LibrarySymbol\"");
        StringAssert.Contains(html, "data-hmi-symbol-id=\"siemens-symbol\"");
        StringAssert.Contains(html, "<svg xmlns=\"http://www.w3.org/2000/svg\"");
        StringAssert.Contains(html, "preserveAspectRatio=\"xMidYMid meet\"");
        Assert.IsFalse(html.Contains("style=\"width: 100%; height: 100%; display: block; transform: rotate(180deg);", StringComparison.Ordinal));
        Assert.IsFalse(html.Contains("<img src=\"data:image/svg+xml;charset=utf-8,", StringComparison.Ordinal));
    }

    private sealed class FakeProject : HmiProjectBase
    {
        private readonly Dictionary<string, HmiScreenBase> _screens = new(StringComparer.Ordinal);
        private readonly Dictionary<string, HmiImage> _images = new(StringComparer.Ordinal);

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

        public void AddImage(HmiImage image)
        {
            if (!string.IsNullOrWhiteSpace(image.Id))
                _images[image.Id!] = image;
            if (!string.IsNullOrWhiteSpace(image.Name))
                _images[image.Name!] = image;
        }

        public override ValueTask<HmiImage?> GetImageAsync(string id, CancellationToken cancellationToken = default)
        {
            _images.TryGetValue(id, out var image);
            return new ValueTask<HmiImage?>(image);
        }
    }

    private static byte[] CreateMinimalEmf()
    {
        var bytes = new byte[88];
        SetU32(bytes, 0, 0x0001);
        SetU32(bytes, 4, 88);
        SetU32(bytes, 8, 0);
        SetU32(bytes, 12, 0);
        SetU32(bytes, 16, 31);
        SetU32(bytes, 20, 31);
        SetU32(bytes, 24, 0);
        SetU32(bytes, 28, 0);
        SetU32(bytes, 32, 3200);
        SetU32(bytes, 36, 3200);
        SetU32(bytes, 40, 0x464d4520);
        SetU32(bytes, 72, 32);
        SetU32(bytes, 76, 32);
        SetU32(bytes, 80, 10);
        SetU32(bytes, 84, 10);
        return bytes;
    }

    private static void SetU32(byte[] bytes, int offset, uint value)
    {
        bytes[offset] = (byte)(value & 0xff);
        bytes[offset + 1] = (byte)((value >> 8) & 0xff);
        bytes[offset + 2] = (byte)((value >> 16) & 0xff);
        bytes[offset + 3] = (byte)((value >> 24) & 0xff);
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
