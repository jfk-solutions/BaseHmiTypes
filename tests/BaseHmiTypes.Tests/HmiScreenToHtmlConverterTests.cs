using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Images;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using BaseHmiTypes.Screens.Defaults;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiScreenToHtmlConverterTests
{
    [TestMethod]
    public async Task ConvertAsync_RendersItemOpacity()
    {
        var rectangle = new HmiRectangle
        {
            Name = "TransparentRectangle",
            Width = 100,
            Height = 50,
            Opacity = 0.25
        };
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(rectangle);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"TransparentRectangle\" style=\"position: absolute;left: 0px;top: 0px;width: 100px;height: 50px;opacity: 0.25;");
    }

    [TestMethod]
    public async Task ConvertAsync_AdaptsTextBorderToContent()
    {
        var screen = new HmiScreen { Name = "Main" };
        var layer = new HmiLayer { Name = "Default" };
        layer.Items.Add(new HmiText
        {
            Name = "AdaptiveText",
            Width = 200,
            Height = 80,
            Text = HmiMultilingualText.FromText("Variable caption"),
            AdaptBorderToContent = true
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "data-adapt-border-to-content");
        StringAssert.Contains(html, "width: 200px;height: 80px;width: max-content;height: max-content;white-space: nowrap;");
        StringAssert.Contains(html, "Variable caption");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersDesignShadow()
    {
        var rectangle = new HmiRectangle
        {
            Name = "ShadowedRectangle",
            Width = 100,
            Height = 50,
            UseDesignShadowSettings = true
        };
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(rectangle);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"ShadowedRectangle\" style=\"position: absolute;left: 0px;top: 0px;width: 100px;height: 50px;filter: drop-shadow(3px 3px 3px rgba(0, 0, 0, 0.35));");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersItemToolTip()
    {
        var rectangle = new HmiRectangle
        {
            Name = "Pump",
            Width = 100,
            Height = 50,
            ToolTipText = HmiMultilingualText.FromText("Pump & valve")
        };
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(rectangle);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"Pump\" title=\"Pump &amp; valve\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersItemTabIndex()
    {
        var rectangle = new HmiRectangle
        {
            Name = "FocusableRectangle",
            Width = 100,
            Height = 50,
            TabIndex = 7
        };
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(rectangle);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"FocusableRectangle\" tabindex=\"7\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersDisabledItemSemantics()
    {
        var rectangle = new HmiRectangle
        {
            Name = "DisabledRectangle",
            Width = 100,
            Height = 50,
            Enabled = false
        };
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(rectangle);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"DisabledRectangle\" aria-disabled=\"true\" style=\"position: absolute;left: 0px;top: 0px;width: 100px;height: 50px;pointer-events: none;");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersDisabledForegroundColors()
    {
        var text = new HmiText
        {
            Name = "DisabledText",
            Text = HmiMultilingualText.FromText("Inactive"),
            Enabled = false,
            ForegroundColor = HmiColor.FromArgb(255, 1, 2, 3),
            DisabledForegroundColor = HmiColor.FromArgb(255, 11, 22, 33),
            DisabledForegroundShadowColor = HmiColor.FromArgb(255, 44, 55, 66),
            UseDisabledForegroundColor = true
        };
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(text);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "data-disabled-foreground-color=\"#0B1621\"");
        StringAssert.Contains(html, "data-disabled-foreground-shadow-color=\"#2C3742\"");
        StringAssert.Contains(html, "data-use-disabled-foreground-color=\"true\"");
        StringAssert.Contains(html, "color: #0B1621;");
        StringAssert.Contains(html, "text-shadow: 1px 1px #2C3742;");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersRectangleRotation()
    {
        var rectangle = new HmiRectangle
        {
            Name = "RotatedRectangle",
            Width = 100,
            Height = 50,
            RotationAngle = 45,
            RotationCenterX = 10,
            RotationCenterY = 20
        };
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(rectangle);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "transform: rotate(45deg);transform-origin: 10px 20px;");
    }

    [TestMethod]
    public async Task ConvertAsync_ExposesItemHotKey()
    {
        var button = new HmiButton
        {
            Name = "ShortcutButton",
            Width = 100,
            Height = 50,
            HotKey = "Ctrl+F11"
        };
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(button);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"ShortcutButton\" data-hmi-hot-key=\"Ctrl+F11\" aria-keyshortcuts=\"Control+F11\"");
    }

    [TestMethod]
    public async Task ConvertAsync_ExposesItemSecurityCode()
    {
        var rectangle = new HmiRectangle
        {
            Name = "SecuredRectangle",
            Width = 100,
            Height = 50,
            SecurityCode = "7"
        };
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(rectangle);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"SecuredRectangle\" data-hmi-security-code=\"7\"");
    }

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
        symbolicIoField.States.Add(new HmiState
        {
            Name = "Stopped",
            Value = 0,
            Text = HmiMultilingualText.FromText("Stopped"),
            BackgroundColor = HmiColor.FromArgb(255, 100, 0, 0),
            ForegroundColor = HmiColor.FromArgb(255, 255, 255, 255)
        });
        symbolicIoField.States.Add(new HmiState
        {
            Name = "Running",
            Value = 2,
            Text = HmiMultilingualText.FromText("Running"),
            BackgroundColor = HmiColor.FromArgb(255, 0, 100, 0),
            CaptionColor = HmiColor.FromArgb(255, 240, 241, 242),
            BorderColor = HmiColor.FromArgb(255, 50, 51, 52)
        });
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(symbolicIoField);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<select id=\"MotorState\"");
        StringAssert.Contains(html, "background-color: #006400;color: #F0F1F2;border-color: #323334;");
        StringAssert.Contains(html, "<option value=\"0\" style=\"background-color: #640000;color: #FFFFFF;\">Stopped</option>");
        StringAssert.Contains(html, "<option value=\"2\" style=\"background-color: #006400;color: #F0F1F2;border-color: #323334;\" selected=\"selected\">Running</option>");
        Assert.IsFalse(html.Contains("HmiSymbolicIOField", StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersSymbolicIoFieldImageState()
    {
        var symbolicIoField = new HmiSymbolicIOField
        {
            Name = "PumpState",
            Width = 80,
            Height = 60,
            Value = 7
        };
        symbolicIoField.States.Add(new HmiState
        {
            Name = "Running",
            Value = 7,
            ImageName = "pump-running.svg",
            Image = new HmiImageSource
            {
                ImageName = "pump-running.svg",
                Uri = "data:image/svg+xml,%3Csvg%2F%3E"
            },
            AlternateImageName = "pump-warning.svg",
            AlternateImage = new HmiImageSource
            {
                ImageName = "pump-warning.svg",
                Uri = "data:image/svg+xml,%3Csvg%20id%3D%22warning%22%2F%3E"
            },
            ImageScaled = true,
            ImageBlink = true,
            ImageBlinkRate = HmiBlinkRate.Fast,
            ImageBackgroundColor = HmiColor.FromArgb(255, 17, 34, 51)
        });
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(symbolicIoField);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"PumpState\"");
        StringAssert.Contains(html, "class=\"hmi-symbolic-image-state\"");
        StringAssert.Contains(html, "data-state-value=\"7\"");
        StringAssert.Contains(html, "data-image-name=\"pump-running.svg\"");
        StringAssert.Contains(html, "data-image-blink=\"true\"");
        StringAssert.Contains(html, "data-alternate-image-name=\"pump-warning.svg\"");
        StringAssert.Contains(html, "data-image-blink-rate=\"Fast\"");
        StringAssert.Contains(html, "background-color: #112233;");
        StringAssert.Contains(html, "<img src=\"data:image/svg+xml,%3Csvg%2F%3E\" alt=\"Running\" class=\"hmi-symbolic-image-base\"");
        StringAssert.Contains(html, "animation: hmi-symbolic-base-flash 0.5s steps(1, end) infinite;");
        StringAssert.Contains(html, "<img src=\"data:image/svg+xml,%3Csvg%20id%3D%22warning%22%2F%3E\" alt=\"Running\" class=\"hmi-symbolic-image-alternate\"");
        StringAssert.Contains(html, "animation: hmi-symbolic-alternate-flash 0.5s steps(1, end) infinite;");
        Assert.IsFalse(html.Contains("<select id=\"PumpState\"", StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersIoFieldPreviewAndInputSettings()
    {
        var field = new HmiIOField
        {
            Name = "Speed",
            Text = HmiProperty.Expression<HmiMultilingualText>("{[PLC]Speed}"),
            ReadOnly = true,
            MaskInput = true,
            FieldLength = 12
        };
        var screen = new HmiScreen { Name = "Main", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer0" };
        layer.Items.Add(field);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<input id=\"Speed\"");
        StringAssert.Contains(html, "value=\"{[PLC]Speed}\"");
        StringAssert.Contains(html, "readonly=\"readonly\"");
        StringAssert.Contains(html, "type=\"password\"");
        StringAssert.Contains(html, "maxlength=\"12\"");
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
    public async Task ConvertAsync_RendersToggleSwitchStatesAndProjectImages()
    {
        var screen = new HmiScreen
        {
            Id = "main",
            Name = "MainScreen",
            Width = 320,
            Height = 240
        };
        var toggle = new HmiToggleSwitch
        {
            Id = "toggle-1",
            Name = "ModeSwitch",
            X = 10,
            Y = 20,
            Width = 120,
            Height = 52,
            State = 1
        };
        toggle.States.Add(new HmiState
        {
            Value = 0,
            Text = HmiMultilingualText.FromText("Stopped"),
            Image = new HmiImageSource { ImageId = "off-image" }
        });
        toggle.States.Add(new HmiState
        {
            Value = 1,
            Text = HmiMultilingualText.FromText("Running"),
            Image = new HmiImageSource { ImageId = "on-image" },
            BackgroundColor = HmiColor.FromArgb(255, 10, 20, 30),
            CaptionColor = HmiColor.FromArgb(255, 240, 241, 242),
            BorderColor = HmiColor.FromArgb(255, 50, 60, 70)
        });
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(toggle);
        screen.Layers.Add(layer);
        var project = new FakeProject(screen);
        project.AddImage(new HmiImage { Id = "off-image", MimeType = "image/png", Data = [1] });
        project.AddImage(new HmiImage { Id = "on-image", MimeType = "image/png", Data = [2] });

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, project);

        StringAssert.Contains(html, "text=\"Stopped\"");
        StringAssert.Contains(html, "alternate-text=\"Running\"");
        StringAssert.Contains(html, "image=\"data:image/png;base64,AQ==\"");
        StringAssert.Contains(html, "alternate-image=\"data:image/png;base64,Ag==\"");
        StringAssert.Contains(html, "background-color: #0A141E;");
        StringAssert.Contains(html, "color: #F0F1F2;");
        StringAssert.Contains(html, "border-color: #323C46;");
        StringAssert.Contains(html, " checked");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersListBoxStates()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 320, Height = 240 };
        var listBox = new HmiListBox
        {
            Id = "list-1",
            Name = "ModeList",
            X = 10,
            Y = 20,
            Width = 120,
            Height = 52,
            Value = 4
        };
        listBox.States.Add(new HmiState
        {
            Value = 2,
            Text = HmiMultilingualText.FromText("Automatic"),
            ImageName = "auto.bmp"
        });
        listBox.States.Add(new HmiState
        {
            Value = 4,
            Text = HmiMultilingualText.FromText("Manual"),
            BackgroundColor = HmiColor.FromArgb(255, 10, 20, 30),
            ForegroundColor = HmiColor.FromArgb(255, 240, 241, 242)
        });
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(listBox);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<select id=\"ModeList\"");
        StringAssert.Contains(html, "value=\"2\" data-image-name=\"auto.bmp\"");
        StringAssert.Contains(html, ">Automatic</option>");
        StringAssert.Contains(html, "value=\"4\" style=\"background-color: #0A141E;color: #F0F1F2;\" selected=\"selected\"");
        StringAssert.Contains(html, ">Manual</option>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersComboBoxStates()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var comboBox = new HmiComboBox
        {
            Name = "ModeCombo",
            Width = 120,
            Height = 28,
            SelectedIndex = 1
        };
        comboBox.States.Add(new HmiState
        {
            Value = 10,
            Text = HmiMultilingualText.FromText("Automatic")
        });
        comboBox.States.Add(new HmiState
        {
            Value = 20,
            Text = HmiMultilingualText.FromText("Manual")
        });
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(comboBox);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<select id=\"ModeCombo\"");
        StringAssert.Contains(html, "<option value=\"10\">Automatic</option>");
        StringAssert.Contains(html, "<option value=\"20\" selected=\"selected\">Manual</option>");
        Assert.IsFalse(html.Contains("HmiComboBox", StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersBarSliderAndScalePreviews()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(new HmiBar
        {
            Name = "LevelBar", Width = 100, Height = 20,
            BeginValue = 0, EndValue = 100, Value = 35
        });
        layer.Items.Add(new HmiSlider
        {
            Name = "SetpointSlider", Y = 30, Width = 100, Height = 20,
            BeginValue = -10, EndValue = 10, Value = 4
        });
        layer.Items.Add(new HmiScale
        {
            Name = "LevelScale", Y = 60, Width = 100, Height = 20,
            BeginValue = 100, EndValue = 0
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<meter id=\"LevelBar\"");
        StringAssert.Contains(html, "min=\"0\" max=\"100\" value=\"35\">35</meter>");
        StringAssert.Contains(html, "<input id=\"SetpointSlider\"");
        StringAssert.Contains(html, "type=\"range\" min=\"-10\" max=\"10\" value=\"4\" disabled=\"disabled\"");
        StringAssert.Contains(html, "<div id=\"LevelScale\"");
        StringAssert.Contains(html, "><span>0</span><span>100</span></div>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersBarFillDirections()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiBar { Name = "UpBar", Width = 20, Height = 100, FillDirection = HmiFillDirection.Up });
        layer.Items.Add(new HmiBar { Name = "DownBar", X = 30, Width = 20, Height = 100, FillDirection = HmiFillDirection.Down });
        layer.Items.Add(new HmiBar { Name = "LeftBar", Y = 110, Width = 100, Height = 20, FillDirection = HmiFillDirection.Left });
        layer.Items.Add(new HmiBar { Name = "RightBar", Y = 140, Width = 100, Height = 20, FillDirection = HmiFillDirection.Right });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"UpBar\" style=\"position: absolute;");
        StringAssert.Contains(html, "writing-mode: vertical-lr; direction: rtl;\" data-fill-direction=\"Up\"");
        StringAssert.Contains(html, "writing-mode: vertical-lr; direction: ltr;\" data-fill-direction=\"Down\"");
        StringAssert.Contains(html, "id=\"LeftBar\"");
        StringAssert.Contains(html, "direction: rtl;\" data-fill-direction=\"Left\"");
        StringAssert.Contains(html, "id=\"RightBar\"");
        StringAssert.Contains(html, "direction: ltr;\" data-fill-direction=\"Right\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersBarScaleTicksAndAppearance()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiBar
        {
            Name = "ScaledBar",
            Width = 120,
            Height = 40,
            BeginValue = 0,
            EndValue = 100,
            Value = 35,
            ShowScale = true,
            DivisionCount = 3,
            TickLabelDecimalPlaces = 1,
            EngineeringUnit = "bar",
            LabelColor = HmiColor.FromArgb(255, 12, 34, 56),
            LabelFont = new HmiFont
            {
                Name = "Arial",
                Size = 9,
                Bold = true
            }
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"ScaledBar\"");
        StringAssert.Contains(html, "data-hmi-bar=\"true\" data-fill-direction=\"Right\"");
        StringAssert.Contains(html, "<meter style=\"width: 100%; flex: 1; min-width: 0; min-height: 0;direction: ltr;\" min=\"0\" max=\"100\" value=\"35\">35</meter>");
        StringAssert.Contains(html, "data-hmi-bar-scale=\"true\"");
        StringAssert.Contains(html, "color: #0C2238; font-family: Arial; font-size: 9px; font-weight: bold;");
        StringAssert.Contains(html, "<span>0.0&nbsp;bar</span><span>50.0&nbsp;bar</span><span>100.0&nbsp;bar</span>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersEnabledBarThresholdMarkers()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        var bar = new HmiBar
        {
            Name = "ThresholdBar",
            Width = 120,
            Height = 20,
            BeginValue = 0,
            EndValue = 100,
            Value = 35,
            FillDirection = HmiFillDirection.Right,
            ThresholdValueMode = HmiThresholdValueMode.Absolute
        };
        bar.Thresholds.Add(new HmiThreshold
        {
            Index = 4,
            Enabled = true,
            Value = 25,
            Color = HmiColor.FromArgb(255, 255, 0, 0)
        });
        bar.Thresholds.Add(new HmiThreshold
        {
            Index = 5,
            Enabled = false,
            Value = 75,
            Color = HmiColor.FromArgb(255, 255, 255, 0)
        });
        layer.Items.Add(bar);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "data-hmi-bar-meter=\"true\"");
        StringAssert.Contains(html, "data-hmi-bar-threshold=\"4\" data-threshold-value=\"25\"");
        StringAssert.Contains(html, "background-color: #FF0000; top: 0; bottom: 0; left: 25%; width: 2px;");
        Assert.IsFalse(html.Contains("data-hmi-bar-threshold=\"5\"", StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersSliderOrientations()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiSlider { Name = "TopSlider", Width = 20, Height = 100, Orientation = 0 });
        layer.Items.Add(new HmiSlider { Name = "BottomSlider", X = 30, Width = 20, Height = 100, Orientation = 1 });
        layer.Items.Add(new HmiSlider { Name = "LeftSlider", Y = 110, Width = 100, Height = 20, Orientation = 2 });
        layer.Items.Add(new HmiSlider { Name = "RightSlider", Y = 140, Width = 100, Height = 20, Orientation = 3 });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "writing-mode: vertical-lr; direction: rtl;\" data-hmi-slider=\"true\" data-orientation=\"Up\"");
        StringAssert.Contains(html, "writing-mode: vertical-lr; direction: ltr;\" data-hmi-slider=\"true\" data-orientation=\"Down\"");
        StringAssert.Contains(html, "id=\"LeftSlider\"");
        StringAssert.Contains(html, "direction: rtl;\" data-hmi-slider=\"true\" data-orientation=\"Left\"");
        StringAssert.Contains(html, "id=\"RightSlider\"");
        StringAssert.Contains(html, "direction: ltr;\" data-hmi-slider=\"true\" data-orientation=\"Right\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersSliderThumbColor()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiSlider
        {
            Name = "ColoredSlider",
            Width = 100,
            Height = 20,
            ThumbBackgroundColor = HmiColor.FromArgb(255, 12, 34, 56)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "input[data-hmi-slider]{accent-color:var(--hmi-slider-thumb-background,auto);");
        StringAssert.Contains(html, "--hmi-slider-thumb-background: #0C2238;");
        StringAssert.Contains(html, "data-hmi-slider=\"true\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersDirectionAwareSliderTrackColors()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiSlider
        {
            Name = "VerticalSlider",
            Width = 20,
            Height = 100,
            Orientation = 0,
            TrackHighBackgroundColor = HmiColor.FromArgb(255, 255, 0, 0),
            TrackLowBackgroundColor = HmiColor.FromArgb(255, 0, 0, 255)
        });
        layer.Items.Add(new HmiSlider
        {
            Name = "HorizontalSlider",
            Y = 110,
            Width = 100,
            Height = 20,
            Orientation = 3,
            TrackHighBackgroundColor = HmiColor.FromArgb(255, 255, 0, 0),
            TrackLowBackgroundColor = HmiColor.FromArgb(255, 0, 0, 255)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "--hmi-slider-track-background: linear-gradient(to bottom, #FF0000, #0000FF);");
        StringAssert.Contains(html, "--hmi-slider-track-background: linear-gradient(to left, #FF0000, #0000FF);");
        StringAssert.Contains(html, "::-webkit-slider-runnable-track");
        StringAssert.Contains(html, "::-moz-range-track");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersSliderStopColors()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiSlider
        {
            Name = "StoppedSlider",
            Width = 100,
            Height = 20,
            Orientation = 3,
            TrackHighBackgroundColor = HmiColor.FromArgb(255, 255, 128, 128),
            TrackLowBackgroundColor = HmiColor.FromArgb(255, 128, 128, 255),
            HighStopColor = HmiColor.FromArgb(255, 255, 0, 0),
            LowStopColor = HmiColor.FromArgb(255, 0, 0, 255)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html,
            "linear-gradient(to left, #FF0000 0 4px, #FF8080 4px, #8080FF calc(100% - 4px), #0000FF calc(100% - 4px) 100%)");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersAlarmIndicatorState()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var indicator = new HmiAlarmIndicator
        {
            Name = "GroupDisplay",
            Width = 80,
            Height = 30,
            AlarmState = 5,
            VisualState = HmiAlarmIndicatorState.CameIn,
            IsGroupRelevant = true,
            SignificantMask = 3,
            EventAcknowledgementMask = 5,
            UseGlobalAlarmClasses = true,
            UseGlobalSettings = false,
            UserValue1 = 11,
            UserValue2 = 12,
            UserValue3 = 13,
            UserValue4 = 14,
            SelectedMessageClass = 3,
            NoAlarmState = 0,
            NumberOfAlarms = 2,
            IsFlashingRequired = true,
            FlashingColor = HmiColor.FromArgb(255, 255, 0, 0),
            ForegroundColor = HmiColor.FromArgb(255, 32, 48, 64),
            IsForegroundFlashingRequired = true,
            FlashingForegroundColor = HmiColor.FromArgb(255, 255, 255, 0),
            FlashingRate = 500,
            ShowAcknowledgedAlarmClasses = new List<int> { 1, 3 },
            ShowPendingAlarmClasses = new List<int> { 2, 4 }
        };
        indicator.MessageClassAppearances.Add(new HmiAlarmIndicatorMessageClassAppearance
        {
            Index = 1,
            IsTextFlashingRequired = true,
            IsBackgroundFlashingRequired = false
        });
        indicator.MessageClassAppearances.Add(new HmiAlarmIndicatorMessageClassAppearance
        {
            Index = 2,
            IsTextFlashingRequired = false,
            IsBackgroundFlashingRequired = true
        });
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(indicator);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"GroupDisplay\"");
        StringAssert.Contains(html, "class=\"hmi-alarm-indicator\"");
        StringAssert.Contains(html, "data-active=\"true\"");
        StringAssert.Contains(html, "data-visual-state=\"CameIn\"");
        StringAssert.Contains(html, "data-group-relevant=\"true\"");
        StringAssert.Contains(html, "data-significant-mask=\"3\"");
        StringAssert.Contains(html, "data-event-acknowledgement-mask=\"5\"");
        StringAssert.Contains(html, "data-use-global-alarm-classes=\"true\"");
        StringAssert.Contains(html, "data-use-global-settings=\"false\"");
        StringAssert.Contains(html, "data-user-value-1=\"11\"");
        StringAssert.Contains(html, "data-user-value-2=\"12\"");
        StringAssert.Contains(html, "data-user-value-3=\"13\"");
        StringAssert.Contains(html, "data-user-value-4=\"14\"");
        StringAssert.Contains(html, "data-selected-message-class=\"3\"");
        StringAssert.Contains(html, "data-text-flashing-message-classes=\"1\"");
        StringAssert.Contains(html, "data-background-flashing-message-classes=\"2\"");
        StringAssert.Contains(html, "data-flashing-required=\"true\"");
        StringAssert.Contains(html, "data-flashing-color=\"#FF0000\"");
        StringAssert.Contains(html, "data-foreground-flashing-required=\"true\"");
        StringAssert.Contains(html, "data-flashing-foreground-color=\"#FFFF00\"");
        StringAssert.Contains(html, "data-flashing-rate=\"500\"");
        StringAssert.Contains(html, "--hmi-background-color-off: transparent;");
        StringAssert.Contains(html, "--hmi-background-color-on: #FF0000;");
        StringAssert.Contains(html, "--hmi-foreground-color-off: #203040;");
        StringAssert.Contains(html, "--hmi-foreground-color-on: #FFFF00;");
        StringAssert.Contains(html, "animation: hmi-background-color-flash 0.5s steps(1, end) infinite, hmi-foreground-color-flash 0.5s steps(1, end) infinite;");
        StringAssert.Contains(html, "data-alarm-state=\"5\"");
        StringAssert.Contains(html, "data-no-alarm-state=\"0\"");
        StringAssert.Contains(html, "data-number-of-alarms=\"2\"");
        StringAssert.Contains(html, "data-show-acknowledged-alarm-classes=\"1,3\"");
        StringAssert.Contains(html, "data-show-pending-alarm-classes=\"2,4\"");
        StringAssert.Contains(html, ">2</div>");
        Assert.IsFalse(html.Contains("HmiAlarmIndicator", StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersAlarmIndicatorText()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiAlarmIndicator
        {
            Name = "GroupDisplay",
            Width = 80,
            Height = 30,
            AlarmState = 5,
            Text = "<Alarm>"
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "data-text=\"&lt;Alarm&gt;\"");
        StringAssert.Contains(html, ">&lt;Alarm&gt;</div>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersAlarmIndicatorFont()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiAlarmIndicator
        {
            Name = "GroupDisplay",
            Width = 80,
            Height = 30,
            Text = "Alarm",
            Font = new HmiFont
            {
                Name = "Arial",
                Size = 12,
                Bold = true
            },
            HorizontalAlignment = HmiHorizontalAlignment.Right,
            VerticalAlignment = HmiVerticalAlignment.Bottom
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "font-family: Arial;");
        StringAssert.Contains(html, "font-size: 12px;");
        StringAssert.Contains(html, "font-weight: bold;");
        StringAssert.Contains(html, "text-align: right;");
        StringAssert.Contains(html, "justify-content: flex-end;");
        StringAssert.Contains(html, "align-items: flex-end;");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersAlarmIndicatorSegments()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        var indicator = new HmiAlarmIndicator
        {
            Name = "GroupDisplay",
            Width = 80,
            Height = 30,
            Text = "A",
            UseEqualSegmentWidths = false
        };
        indicator.Segments.Add(new HmiAlarmIndicatorSegment
        {
            Index = 1,
            Width = 15,
            MessageClasses = new List<int> { 1, 2 }
        });
        indicator.Segments.Add(new HmiAlarmIndicatorSegment
        {
            Index = 2,
            Width = 25,
            MessageClasses = new List<int> { 3 }
        });
        indicator.Segments.Add(new HmiAlarmIndicatorSegment { Index = 3, Width = 0 });
        layer.Items.Add(indicator);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "data-equal-segment-widths=\"false\"");
        StringAssert.Contains(html, "data-segment-count=\"3\"");
        StringAssert.Contains(html, "data-segment-index=\"1\" data-message-classes=\"1,2\" style=\"flex: 0 0 15px;");
        StringAssert.Contains(html, "data-segment-index=\"2\" data-message-classes=\"3\" style=\"flex: 0 0 25px;");
        StringAssert.Contains(html, "data-segment-index=\"3\" style=\"display: none;");
        StringAssert.Contains(html, "class=\"hmi-alarm-indicator-label\"");
        StringAssert.Contains(html, ">A</span></div>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersLockedAlarmIndicator()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiAlarmIndicator
        {
            Name = "GroupDisplay",
            Width = 80,
            Height = 30,
            Text = "Alarm",
            IsLocked = true,
            LockedText = "LOCKED",
            LockedForegroundColor = HmiColor.FromArgb(255, 255, 255, 0),
            LockedBackgroundColor = HmiColor.FromArgb(255, 32, 48, 64)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "data-locked=\"true\"");
        StringAssert.Contains(html, "data-locked-text=\"LOCKED\"");
        StringAssert.Contains(html, "data-locked-foreground-color=\"#FFFF00\"");
        StringAssert.Contains(html, "data-locked-background-color=\"#203040\"");
        StringAssert.Contains(html, "color: #FFFF00;");
        StringAssert.Contains(html, "background-color: #203040;");
        StringAssert.Contains(html, ">LOCKED</div>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersAlarmIndicatorFillPattern()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiAlarmIndicator
        {
            Name = "GroupDisplay",
            Width = 80,
            Height = 30,
            BackFillPattern = 3 << 16,
            FillPattern = HmiFillPattern.Checkers,
            PatternColor = HmiColor.FromArgb(255, 12, 34, 56)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "background-image: conic-gradient(#0C2238 25%, transparent 0 50%, #0C2238 0 75%, transparent 0);");
        StringAssert.Contains(html, "background-size: 8px 8px;");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersClockPreview()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(new HmiClock
        {
            Name = "BatchClock",
            Width = 160,
            Height = 24,
            ShowDate = true,
            ShowTime = true,
            ShowSeconds = false,
            Format = "dateAndTime",
            TimeZone = "UTC"
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<time id=\"BatchClock\"");
        StringAssert.Contains(html, "datetime=\"2000-01-01T12:34:56\"");
        StringAssert.Contains(html, "data-format=\"dateAndTime\" data-time-zone=\"UTC\"");
        StringAssert.Contains(html, ">2000-01-01 12:34</time>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersArrowIndicatorPreview()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(new HmiArrowIndicator
        {
            Name = "LevelArrow",
            Width = 30,
            Height = 120,
            BeginValue = 0,
            EndValue = 100,
            Value = 25,
            Orientation = 1
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"LevelArrow\"");
        StringAssert.Contains(html, "data-min=\"0\" data-max=\"100\" data-value=\"25\" data-orientation=\"vertical\"");
        StringAssert.Contains(html, "bottom: 25%; transform: translate(-50%, 50%);\">▲</span>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersInertWebControlPreview()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(new HmiWebControl
        {
            Name = "ManualBrowser",
            Width = 300,
            Height = 180,
            Url = HmiProperty.Expression("{[PLC]ManualUrl}", "https://example.test/manual?a=1&b=2"),
            ShowAddressBar = true,
            UseParameterPlaceholders = true,
            NavigateBack = HmiProperty.Expression<bool>("{[PLC]Back}"),
            Refresh = HmiProperty.Expression<bool>("{[PLC]Refresh}")
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"ManualBrowser\"");
        StringAssert.Contains(html, "data-url=\"https://example.test/manual?a=1&amp;b=2\"");
        StringAssert.Contains(html, "data-use-parameter-placeholders");
        StringAssert.Contains(html, "data-navigate-back=\"{[PLC]Back}\"");
        StringAssert.Contains(html, "data-refresh=\"{[PLC]Refresh}\"");
        StringAssert.Contains(html, ">https://example.test/manual?a=1&amp;b=2</div>");
        StringAssert.Contains(html, ">Web browser</div>");
        Assert.IsFalse(html.Contains("<iframe", StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersInertDataGridPreview()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(new HmiDataGridControl
        {
            Name = "BatchHistory",
            Width = 300,
            Height = 180,
            ShowToolbar = true,
            ShowStatusBar = true,
            ShowExportCsv = true,
            ShowProperties = false,
            DataSourceKind = HmiDataGridDataSourceKind.SqlServer,
            SourceDataSourceKind = "SQL Server",
            DataSourceName = "ProductionHistory",
            TableOrView = "dbo.BatchEvents",
            TimeSortDirection = HmiDataGridSortDirection.Descending,
            SourceTimeSortDirection = "Descending",
            TimePeriodAbsoluteMode = true,
            TimePeriodStart = "2026-08-30T08:00:00",
            TimePeriodEnd = "2026-08-30T12:00:00"
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"BatchHistory\"");
        StringAssert.Contains(html, "data-show-toolbar=\"true\"");
        StringAssert.Contains(html, "data-show-properties=\"false\"");
        StringAssert.Contains(html, "data-source-kind=\"SqlServer\"");
        StringAssert.Contains(html, "data-source-kind-raw=\"SQL Server\"");
        StringAssert.Contains(html, "data-source-name=\"ProductionHistory\"");
        StringAssert.Contains(html, "data-table-or-view=\"dbo.BatchEvents\"");
        StringAssert.Contains(html, "data-time-sort=\"Descending\"");
        StringAssert.Contains(html, "data-time-period-absolute=\"true\"");
        StringAssert.Contains(html, ">Data grid · Export CSV</div>");
        StringAssert.Contains(html, ">Time: 2026-08-30T08:00:00 – 2026-08-30T12:00:00</div>");
        StringAssert.Contains(html, ">SqlServer: ProductionHistory · dbo.BatchEvents</div>");
        StringAssert.Contains(html, ">Status</div>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersInertRecipeTablePreview()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        var recipe = new HmiRecipeControl
        {
            Name = "RecipeTable",
            Width = 300,
            Height = 180,
            ViewKind = HmiRecipeViewKind.Table,
            DefaultRecipeName = "Batch A",
            ShowHeader = true,
            ShowFooter = true,
            ViewOnly = true,
            LinesPerItem = 2
        };
        recipe.ColumnDefinitions.Add(new HmiRecipeColumn
        {
            Type = HmiRecipeColumnType.IngredientName,
            HeaderText = HmiMultilingualText.FromText("Ingredient")
        });
        recipe.ColumnDefinitions.Add(new HmiRecipeColumn
        {
            Type = HmiRecipeColumnType.RecipeValue,
            HeaderText = HmiMultilingualText.FromText("Setpoint")
        });
        recipe.ColumnDefinitions.Add(new HmiRecipeColumn
        {
            Type = HmiRecipeColumnType.TagName,
            Visible = false
        });
        layer.Items.Add(recipe);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"RecipeTable\"");
        StringAssert.Contains(html, "data-view-kind=\"Table\"");
        StringAssert.Contains(html, "data-default-recipe=\"Batch A\"");
        StringAssert.Contains(html, "data-view-only=\"true\"");
        StringAssert.Contains(html, "data-column-type=\"IngredientName\">Ingredient</th>");
        StringAssert.Contains(html, "data-column-type=\"RecipeValue\">Setpoint</th>");
        Assert.IsFalse(html.Contains("data-column-type=\"TagName\"", StringComparison.Ordinal));
        StringAssert.Contains(html, "colspan=\"2\" style=\"text-align: center;\">Recipe data not loaded</td>");
        StringAssert.Contains(html, ">Recipe control</div>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersInertAuditTrailPreview()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        var audit = new HmiAuditTrailControl
        {
            Name = "OperatorAudit",
            Width = 300,
            Height = 180,
            ViewKind = HmiAuditTrailViewKind.List,
            ShowHeader = true,
            LinesPerEntry = 2,
            WordWrap = true,
            ReceiveSelectionFrom = "AuditDetail"
        };
        audit.Fields.Add(new HmiAuditTrailFieldPresentation
        {
            Field = HmiAuditTrailField.OccurredTime,
            HeaderText = HmiMultilingualText.FromText("When"),
            TimeAndDateFormat = "yyyy-MM-dd HH:mm:ss"
        });
        audit.Fields.Add(new HmiAuditTrailFieldPresentation
        {
            Field = HmiAuditTrailField.Username,
            HeaderText = HmiMultilingualText.FromText("User")
        });
        audit.Fields.Add(new HmiAuditTrailFieldPresentation
        {
            Field = HmiAuditTrailField.Resource,
            Visible = false
        });
        layer.Items.Add(audit);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"OperatorAudit\"");
        StringAssert.Contains(html, "data-view-kind=\"List\"");
        StringAssert.Contains(html, "data-lines-per-entry=\"2\"");
        StringAssert.Contains(html, "data-word-wrap=\"true\"");
        StringAssert.Contains(html, "data-receive-selection-from=\"AuditDetail\"");
        StringAssert.Contains(html, "data-field=\"OccurredTime\" data-time-format=\"yyyy-MM-dd HH:mm:ss\">When</th>");
        StringAssert.Contains(html, "data-field=\"Username\">User</th>");
        Assert.IsFalse(html.Contains("data-field=\"Resource\"", StringComparison.Ordinal));
        StringAssert.Contains(html, "colspan=\"2\" style=\"text-align: center;\">Audit data not loaded</td>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersInertAlarmPreviews()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        var alarms = new HmiAlarmControl
        {
            Name = "ActiveAlarms",
            Width = 300,
            Height = 160,
            ViewKind = HmiAlarmViewKind.AlarmAndEventSummary,
            ShowHeader = true,
            ShowTitle = true,
            Resizable = true,
            Movable = true,
            Closeable = true,
            HeaderBackgroundColor = HmiColor.FromArgb(255, 0xE3, 0xE3, 0xE3),
            HeaderForegroundColor = HmiColor.FromArgb(255, 0x01, 0x02, 0x03),
            HeaderBorderColor = HmiColor.FromArgb(255, 0x66, 0x77, 0x88),
            ShowToolbar = true,
            ToolbarBackgroundColor = HmiColor.FromArgb(255, 0x44, 0x33, 0x22),
            ToolbarForegroundColor = HmiColor.FromArgb(255, 0xFA, 0xFB, 0xFC),
            GridLineColor = HmiColor.FromArgb(255, 0x44, 0x55, 0x66),
            GridLineWidth = 2,
            ShowHorizontalGridLines = false,
            ShowVerticalGridLines = true,
            ShowHorizontalScrollbar = true,
            ShowVerticalScrollbar = false,
            TableBackgroundColor = HmiColor.FromArgb(255, 0x10, 0x20, 0x30),
            TableForegroundColor = HmiColor.FromArgb(255, 0xE0, 0xD0, 0xC0),
            UseAlternatingRowColors = true,
            AlternatingRowBackgroundColor = HmiColor.FromArgb(255, 0x12, 0x34, 0x56),
            AlternatingRowForegroundColor = HmiColor.FromArgb(255, 0xAB, 0xCD, 0xEF),
            TableHeaderBackgroundColor = HmiColor.FromArgb(255, 0xE3, 0xE3, 0xE3),
            TableHeaderForegroundColor = HmiColor.FromArgb(255, 0x01, 0x02, 0x03),
            TableHeaderHorizontalAlignment = HmiHorizontalAlignment.Center,
            TableHeaderBorderColor = HmiColor.FromArgb(255, 0x66, 0x77, 0x88),
            TableHeaderBorderWidth = 3,
            SelectionBackgroundColor = HmiColor.FromArgb(255, 0x70, 0x80, 0x90),
            SelectionForegroundColor = HmiColor.FromArgb(255, 0xF1, 0xF2, 0xF3),
            SelectionRectangleMode = 2,
            UseAutomaticSelectionRectangleColor = false,
            SelectionRectangleColor = HmiColor.FromArgb(255, 0x0A, 0x0B, 0x0C),
            SelectionRectangleWidth = 2,
            ShowStatusBar = true,
            StatusBarBackgroundColor = HmiColor.FromArgb(255, 0x21, 0x32, 0x43),
            StatusBarForegroundColor = HmiColor.FromArgb(255, 0xFE, 0xDC, 0xBA),
            StatusBarFont = new HmiFont
            {
                Name = "Tahoma",
                Size = 8,
                Weight = 600,
                Italic = true
            },
            ContentFont = new HmiFont
            {
                Name = "Arial",
                Size = 9.75,
                Weight = 400
            },
            HeaderFont = new HmiFont
            {
                Name = "Siemens Sans",
                Size = 10,
                Weight = 700,
                Italic = true,
                Underline = true,
                Strikethrough = true
            },
            ListMode = HmiAlarmListMode.Active,
            ActiveAlarmsTitle = HmiMultilingualText.FromText("Active process alarms"),
            NumberOfRows = 8,
            ShowWaitingMessage = true,
            ShowOutOfScopeAlarms = false,
            ShowAcknowledgeButton = true,
            ShowHelpButton = true
        };
        alarms.FilteredTriggers.Add("Motor*");
        alarms.ColumnDefinitions.Add(new HmiAlarmColumn
        {
            Type = HmiAlarmColumnType.AlarmTime,
            HeaderText = HmiMultilingualText.FromText("Time"),
            TimeAndDateFormat = "HH:mm:ss"
        });
        alarms.ColumnDefinitions.Add(new HmiAlarmColumn
        {
            Type = HmiAlarmColumnType.Message,
            HeaderText = HmiMultilingualText.FromText("Message")
        });
        alarms.ColumnDefinitions.Add(new HmiAlarmColumn
        {
            Type = HmiAlarmColumnType.AlarmState,
            Visible = false
        });
        layer.Items.Add(alarms);
        layer.Items.Add(new HmiAlarmLineControl
        {
            Name = "AlarmBanner",
            Y = 170,
            Width = 300,
            Height = 30,
            ViewKind = HmiAlarmLineViewKind.AlarmBanner,
            QueueNewAlarms = true,
            ShowAlarmTime = true,
            AlarmTimeFormat = "HH:mm",
            ShowAlarmState = true
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"ActiveAlarms\"");
        StringAssert.Contains(html, "data-view-kind=\"AlarmAndEventSummary\"");
        StringAssert.Contains(html, "data-list-mode=\"Active\"");
        StringAssert.Contains(html, "data-window-resizable=\"true\"");
        StringAssert.Contains(html, "data-window-movable=\"true\"");
        StringAssert.Contains(html, "data-window-closeable=\"true\"");
        StringAssert.Contains(html, "data-header-background-color=\"#E3E3E3\"");
        StringAssert.Contains(html, "data-header-foreground-color=\"#010203\"");
        StringAssert.Contains(html, "data-header-border-color=\"#667788\"");
        StringAssert.Contains(html, "data-show-toolbar=\"true\"");
        StringAssert.Contains(html, "data-toolbar-background-color=\"#443322\"");
        StringAssert.Contains(html, "data-toolbar-foreground-color=\"#FAFBFC\"");
        StringAssert.Contains(html, "data-grid-line-color=\"#445566\"");
        StringAssert.Contains(html, "data-grid-line-width=\"2\"");
        StringAssert.Contains(html, "data-show-horizontal-grid-lines=\"false\"");
        StringAssert.Contains(html, "data-show-vertical-grid-lines=\"true\"");
        StringAssert.Contains(html, "data-show-horizontal-scrollbar=\"true\"");
        StringAssert.Contains(html, "data-show-vertical-scrollbar=\"false\"");
        StringAssert.Contains(html, "overflow-x: auto;overflow-y: hidden;");
        StringAssert.Contains(html, "data-table-background-color=\"#102030\"");
        StringAssert.Contains(html, "data-table-foreground-color=\"#E0D0C0\"");
        StringAssert.Contains(html, "data-use-alternating-row-colors=\"true\"");
        StringAssert.Contains(html, "data-alternating-row-background-color=\"#123456\"");
        StringAssert.Contains(html, "data-alternating-row-foreground-color=\"#ABCDEF\"");
        StringAssert.Contains(html, "data-table-header-background-color=\"#E3E3E3\"");
        StringAssert.Contains(html, "data-table-header-foreground-color=\"#010203\"");
        StringAssert.Contains(html, "data-table-header-horizontal-alignment=\"Center\"");
        StringAssert.Contains(html, "data-table-header-border-color=\"#667788\"");
        StringAssert.Contains(html, "data-selection-background-color=\"#708090\"");
        StringAssert.Contains(html, "data-selection-foreground-color=\"#F1F2F3\"");
        StringAssert.Contains(html, "data-selection-rectangle-mode=\"2\"");
        StringAssert.Contains(html, "data-use-automatic-selection-rectangle-color=\"false\"");
        StringAssert.Contains(html, "data-selection-rectangle-color=\"#0A0B0C\"");
        StringAssert.Contains(html, "data-selection-rectangle-width=\"2\"");
        StringAssert.Contains(html, "data-show-status-bar=\"true\"");
        StringAssert.Contains(html, "data-status-bar-background-color=\"#213243\"");
        StringAssert.Contains(html, "data-status-bar-foreground-color=\"#FEDCBA\"");
        StringAssert.Contains(html, "--hmi-grid-line-color: #445566;");
        StringAssert.Contains(html, "class=\"hmi-alarm-table hmi-alarm-table--alternating\" style=\"width: 100%; border-collapse: collapse; table-layout: fixed;background-color: #102030;color: #E0D0C0;--hmi-alarm-alternating-row-background: #123456;--hmi-alarm-alternating-row-foreground: #ABCDEF;");
        StringAssert.Contains(html, ".hmi-alarm-table--alternating tbody tr:nth-child(even)>td{background-color:var(--hmi-alarm-alternating-row-background,inherit);color:var(--hmi-alarm-alternating-row-foreground,inherit);");
        StringAssert.Contains(html, "border-style: solid; border-color: var(--hmi-grid-line-color, currentColor); border-width: 0px 2px;");
        StringAssert.Contains(html, "background-color: #708090;color: #F1F2F3;outline: 2px solid #0A0B0C;outline-offset: -2px;");
        StringAssert.Contains(html, "font-family: Arial;font-size: 9.75px;font-weight: 400;");
        StringAssert.Contains(html, "font-family: Siemens Sans;font-size: 10px;font-weight: 700;font-style: italic;text-decoration: underline line-through;");
        StringAssert.Contains(html, "background-color: #E3E3E3;color: #010203;border-bottom-color: #667788;");
        StringAssert.Contains(html, "background-color: #E3E3E3;color: #010203;text-align: center;border-color: #667788;border-width: 3px;font-family: Siemens Sans;");
        StringAssert.Contains(html, "resize: both;");
        StringAssert.Contains(html, "cursor: move;");
        StringAssert.Contains(html, "aria-label=\"Close\" disabled");
        StringAssert.Contains(html, "data-number-of-rows=\"8\"");
        StringAssert.Contains(html, "data-show-waiting-message=\"true\"");
        StringAssert.Contains(html, "data-show-out-of-scope-alarms=\"false\"");
        StringAssert.Contains(html, "data-filtered-triggers=\"Motor*\"");
        StringAssert.Contains(html, ">Active process alarms</span>");
        StringAssert.Contains(html, "data-column-type=\"AlarmTime\" data-time-format=\"HH:mm:ss\">Time</th>");
        StringAssert.Contains(html, "data-column-type=\"Message\">Message</th>");
        Assert.IsFalse(html.Contains("data-column-type=\"AlarmState\"", StringComparison.Ordinal));
        StringAssert.Contains(html, ">Alarm data not loaded</td>");
        StringAssert.Contains(html, "class=\"hmi-alarm-toolbar\" role=\"toolbar\" style=\"flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;background-color: #443322;color: #FAFBFC;\">Acknowledge · Help</div>");
        StringAssert.Contains(html, "class=\"hmi-alarm-status-bar\" role=\"status\" style=\"flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;background-color: #213243;color: #FEDCBA;font-family: Tahoma;font-size: 8px;font-weight: 600;font-style: italic;\">Status</div>");
        StringAssert.Contains(html, "<div id=\"AlarmBanner\"");
        StringAssert.Contains(html, "data-view-kind=\"AlarmBanner\"");
        StringAssert.Contains(html, "data-queue-new-alarms=\"true\"");
        StringAssert.Contains(html, "data-show-alarm-state=\"true\"");
        StringAssert.Contains(html, "data-show-alarm-time=\"true\" data-time-format=\"HH:mm\"");
        StringAssert.Contains(html, ">Alarm data not loaded</div>");
    }

    [TestMethod]
    public async Task ConvertAsync_DoesNotRenderDisabledAlternatingAlarmRows()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(new HmiAlarmControl
        {
            Name = "Alarms",
            Width = 300,
            Height = 160,
            UseAlternatingRowColors = false,
            AlternatingRowBackgroundColor = HmiColor.FromArgb(255, 0x12, 0x34, 0x56)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "data-use-alternating-row-colors=\"false\"");
        StringAssert.Contains(html, "class=\"hmi-alarm-table\"");
        Assert.IsFalse(html.Contains("class=\"hmi-alarm-table hmi-alarm-table--alternating\"", StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersInertOpaqueHostControlPreviews()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(new HmiOcxControl
        {
            Name = "LegacyTrend",
            Width = 300,
            Height = 120,
            OcxGuid = "{11111111-2222-3333-4444-555555555555}",
            OcxName = "Legacy Trend Control",
            OcxProgramId = "Vendor.Trend.1",
            OcxFileName = "trend.ocx",
            OcxFileVersion = "1.2.3",
            OcxStateFormat = "binary",
            OcxState = [1, 2, 3, 4]
        });
        layer.Items.Add(new HmiDotNetControlContainer
        {
            Name = "ManagedControl",
            Y = 130,
            Width = 300,
            Height = 80
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"LegacyTrend\"");
        StringAssert.Contains(html, "data-ocx-guid=\"{11111111-2222-3333-4444-555555555555}\"");
        StringAssert.Contains(html, "data-ocx-program-id=\"Vendor.Trend.1\"");
        StringAssert.Contains(html, "data-ocx-file-name=\"trend.ocx\"");
        StringAssert.Contains(html, "data-ocx-file-version=\"1.2.3\"");
        StringAssert.Contains(html, "data-state-format=\"binary\" data-state-length=\"4\"");
        StringAssert.Contains(html, ">ActiveX control</div>");
        StringAssert.Contains(html, ">Legacy Trend Control</div>");
        StringAssert.Contains(html, "<div id=\"ManagedControl\"");
        StringAssert.Contains(html, ">.NET control</div>");
        StringAssert.Contains(html, ">Metadata preserved</div>");
        Assert.IsFalse(html.Contains("<object", StringComparison.Ordinal));
        Assert.IsFalse(html.Contains("<embed", StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersEmptyCustomWidgetPreview()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiCustomWidgetContainer
        {
            Name = "External application",
            Width = 200,
            Height = 80
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"External application\"");
        StringAssert.Contains(html, "data-hmi-custom-widget-type=\"HmiCustomWidgetContainer\"");
        StringAssert.Contains(html, "<span aria-hidden=\"true\">External application</span>");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersHostedApplicationWindowChrome()
    {
        var screen = new HmiScreen { Name = "Main" };
        var layer = new HmiLayer { Name = "Default" };
        layer.Items.Add(new HmiCustomWidgetContainer
        {
            Name = "Diagnostics",
            Width = 320,
            Height = 180,
            Resizable = true,
            Movable = true,
            ShowWindowBorder = true,
            ShowCaption = true,
            ShowMaximizeButton = true,
            ShowCloseButton = true,
            AlwaysOnTop = true,
            HostedApplication = "Global Script",
            HostedTemplate = "GSC Diagnostics"
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "data-window-resizable data-window-movable data-window-border data-window-caption data-window-maximize data-window-close data-window-always-on-top");
        StringAssert.Contains(html, "data-hosted-application=\"Global Script\" data-hosted-template=\"GSC Diagnostics\"");
        StringAssert.Contains(html, "border: 1px solid #6b7280;resize: both;z-index: 2147483647;");
        StringAssert.Contains(html, "class=\"hmi-hosted-window-caption\"");
        StringAssert.Contains(html, "cursor: move;");
        StringAssert.Contains(html, "aria-label=\"Maximize\"");
        StringAssert.Contains(html, "aria-label=\"Close\"");
        StringAssert.Contains(html, "GSC Diagnostics");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersInertRadarChartPreview()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(new HmiRadarChartControl
        {
            Name = "ProcessRadar",
            Width = 300,
            Height = 180,
            Title = HmiMultilingualText.FromText("Process overview"),
            SeriesCount = 3,
            CategoryCount = 8,
            RadarShape = HmiRadarShape.Polygon,
            SourceRadarShape = "Polygon",
            ChartBackgroundColor = HmiColor.FromArgb(255, 17, 34, 51),
            GridLineStyle = HmiLineStyle.Dash,
            SourceGridLineStyle = "Dash",
            GridLineColor = HmiColor.FromArgb(255, 68, 85, 102),
            BandedColor = HmiColor.FromArgb(255, 119, 136, 153),
            ShowLegend = true,
            LegendPosition = HmiRadarLegendPosition.Right,
            SourceLegendPosition = "Right",
            DecimalPlaces = 2,
            RefreshRateSeconds = 1.5
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"ProcessRadar\"");
        StringAssert.Contains(html, "data-series-count=\"3\" data-category-count=\"8\"");
        StringAssert.Contains(html, "data-radar-shape=\"Polygon\"");
        StringAssert.Contains(html, "data-chart-background=\"#112233\"");
        StringAssert.Contains(html, "data-grid-line-style=\"Dash\"");
        StringAssert.Contains(html, "data-grid-line-color=\"#445566\"");
        StringAssert.Contains(html, "data-banded-color=\"#778899\"");
        StringAssert.Contains(html, "data-show-legend=\"true\"");
        StringAssert.Contains(html, "data-legend-position=\"Right\"");
        StringAssert.Contains(html, "data-decimal-places=\"2\"");
        StringAssert.Contains(html, "data-refresh-rate-seconds=\"1.5\"");
        StringAssert.Contains(html, ">Process overview</div>");
        StringAssert.Contains(html, ">Radar data not loaded (Series: 3 · Categories: 8)</div>");
        Assert.IsFalse(html.Contains("<canvas", StringComparison.Ordinal));
    }

    [TestMethod]
    public async Task ConvertAsync_RendersInertSystemDiagnosisPreviews()
    {
        var screen = new HmiScreen { Id = "main", Name = "MainScreen", Width = 640, Height = 480 };
        var layer = new HmiLayer { Id = "layer-1", Name = "Layer 1" };
        layer.Items.Add(new HmiSystemDiagnosisControl
        {
            Name = "MeDiagnostics",
            Width = 300,
            Height = 100,
            ViewKind = HmiSystemDiagnosisViewKind.DiagnosticsList
        });
        layer.Items.Add(new HmiSystemDiagnosisControl
        {
            Name = "SeDiagnostics",
            Y = 110,
            Width = 300,
            Height = 100,
            ViewKind = HmiSystemDiagnosisViewKind.DiagnosticsViewer
        });
        layer.Items.Add(new HmiSystemDiagnosisControl
        {
            Name = "AutomaticSummary",
            Y = 220,
            Width = 300,
            Height = 100,
            ViewKind = HmiSystemDiagnosisViewKind.AutomaticEventSummary
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<div id=\"MeDiagnostics\"");
        StringAssert.Contains(html, "data-view-kind=\"DiagnosticsList\"");
        StringAssert.Contains(html, ">Diagnostics list</div>");
        StringAssert.Contains(html, "<div id=\"SeDiagnostics\"");
        StringAssert.Contains(html, "data-view-kind=\"DiagnosticsViewer\"");
        StringAssert.Contains(html, ">Diagnostics viewer</div>");
        StringAssert.Contains(html, "<div id=\"AutomaticSummary\"");
        StringAssert.Contains(html, "data-view-kind=\"AutomaticEventSummary\"");
        StringAssert.Contains(html, ">Automatic diagnostic event summary</div>");
        Assert.AreEqual(3, CountOccurrences(html, ">Diagnostic data not loaded</div>"));
        Assert.IsFalse(html.Contains("<button", StringComparison.Ordinal));
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
    public async Task ConvertAsync_RendersScreenWindowViewportModes()
    {
        var main = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiScreenWindow
        {
            Id = "fit-picture",
            Name = "FitPicture",
            ScreenId = "detail",
            Width = 200,
            Height = 100,
            FitScreenToWindow = true,
            ShowScrollBars = true
        });
        layer.Items.Add(new HmiScreenWindow
        {
            Id = "fit-window",
            Name = "FitWindow",
            ScreenId = "detail",
            Width = 50,
            Height = 50,
            FitWindowToScreen = true,
            ZoomPercent = 150
        });
        layer.Items.Add(new HmiScreenWindow
        {
            Id = "scroll-window",
            Name = "ScrollWindow",
            ScreenId = "detail",
            Width = 50,
            Height = 50,
            ShowScrollBars = true,
            ZoomPercent = 125,
            OffsetLeft = 40,
            OffsetTop = 20,
            ScrollPositionLeft = 15,
            ScrollPositionTop = 10
        });
        main.Layers.Add(layer);

        var detail = new HmiScreen { Id = "detail", Name = "Detail", Width = 400, Height = 200 };
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(main, new FakeProject(detail));

        StringAssert.Contains(html, "data-fit-screen-to-window data-show-scrollbars id=\"FitPicture\"");
        StringAssert.Contains(html, "width: 200px; height: 100px; overflow: hidden;");
        StringAssert.Contains(html, "transform: scale(0.5, 0.5);");
        StringAssert.Contains(html, "data-fit-window-to-screen data-zoom-percent=\"150\" id=\"FitWindow\"");
        StringAssert.Contains(html, "width: 600px;height: 300px;overflow: hidden;");
        StringAssert.Contains(html, "transform: scale(1.5, 1.5);");
        StringAssert.Contains(html, "data-show-scrollbars data-zoom-percent=\"125\" data-picture-offset-x=\"40\" data-picture-offset-y=\"20\" data-scroll-position-x=\"15\" data-scroll-position-y=\"10\" id=\"ScrollWindow\"");
        StringAssert.Contains(html, "overflow: auto;");
        StringAssert.Contains(html, "width: 450px; height: 225px; overflow: hidden;");
        StringAssert.Contains(html, "left: -50px; top: -25px;");
        StringAssert.Contains(html, "transform: scale(1.25, 1.25);");
        StringAssert.Contains(html, "<script>(e=>{e.scrollLeft=15;e.scrollTop=10;})(document.currentScript.previousElementSibling)</script>");
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
            LineWidth = 3,
            DashType = (int)HmiLineStyle.DashDot
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
        StringAssert.Contains(html, "stroke-dasharray=\"6 3 1 3\"");
        StringAssert.Contains(html, "stroke-linecap=\"round\"");
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
    public async Task ConvertAsync_RendersSvgLineCaps()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiLine
        {
            Name = "SquareLine",
            Width = 100,
            Height = 20,
            X1 = 0,
            Y1 = 10,
            X2 = 100,
            Y2 = 10,
            LineCap = HmiLineCap.Square
        });
        var polyline = new HmiPolyline
        {
            Name = "RoundedPolyline",
            Width = 100,
            Height = 20,
            LineCap = HmiLineCap.Round
        };
        polyline.Points.Add(new HmiPoint(0, 10));
        polyline.Points.Add(new HmiPoint(100, 10));
        layer.Items.Add(polyline);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "id=\"SquareLine\"");
        StringAssert.Contains(html, "stroke-linecap=\"square\"");
        StringAssert.Contains(html, "id=\"RoundedPolyline\"");
        StringAssert.Contains(html, "stroke-linecap=\"round\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersSvgLineMarkers()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiLine
        {
            Name = "FlowLine",
            Width = 100,
            Height = 20,
            X1 = 0,
            Y1 = 10,
            X2 = 100,
            Y2 = 10,
            LineColor = HmiColor.FromArgb(255, 0, 64, 128),
            StartMarker = HmiLineMarker.Arrow,
            EndMarker = HmiLineMarker.FilledCircle
        });
        var polyline = new HmiPolyline
        {
            Name = "ReturnLine",
            Width = 100,
            Height = 20,
            StartMarker = HmiLineMarker.FilledArrowReversed,
            EndMarker = HmiLineMarker.Line
        };
        polyline.Points.Add(new HmiPoint(0, 10));
        polyline.Points.Add(new HmiPoint(100, 10));
        layer.Items.Add(polyline);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "marker-start=\"url(#hmi-marker-start-FlowLine)\"");
        StringAssert.Contains(html, "marker-end=\"url(#hmi-marker-end-FlowLine)\"");
        StringAssert.Contains(html, "<marker id=\"hmi-marker-start-FlowLine\"");
        StringAssert.Contains(html, "d=\"M0 0L10 5L0 10\" fill=\"none\" stroke=\"#004080\"");
        StringAssert.Contains(html, "<marker id=\"hmi-marker-end-FlowLine\"");
        StringAssert.Contains(html, "<circle cx=\"5\" cy=\"5\" r=\"4\" fill=\"#004080\" stroke=\"#004080\"");
        StringAssert.Contains(html, "d=\"M10 0L0 5L10 10Z\"");
        StringAssert.Contains(html, "d=\"M5 0V10\"");
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
    public async Task ConvertAsync_RendersRectangleCornerRadii()
    {
        var screen = new HmiScreen { Name = "Main" };
        var layer = new HmiLayer { Name = "Default" };
        layer.Items.Add(new HmiRectangle
        {
            Name = "RoundedFrame",
            Width = 100,
            Height = 50,
            TopLeftRadius = (10d, 5d),
            TopRightRadius = (20d, 6d),
            BottomRightRadius = (30d, 7d),
            BottomLeftRadius = (40d, 8d)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "border-radius: 10px 20px 30px 40px / 5px 6px 7px 8px;");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersPaintedShapeBorderStyle()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiRectangle
        {
            Id = "rectangle-1",
            Name = "DottedFrame",
            Width = 100,
            Height = 50,
            BorderWidth = 3,
            BorderStyle = (int)HmiLineStyle.Dot,
            DashType = (int)HmiLineStyle.Dot
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "border-style: dotted;");
        StringAssert.Contains(html, "border-width: 3px;");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersShapeFillAnimationPreview()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiRectangle
        {
            Id = "tank",
            Name = "Tank",
            Width = 100,
            Height = 50,
            BackgroundColor = HmiColor.FromArgb(255, 0, 128, 255),
            FillAnimation = new HmiFillAnimation
            {
                Expression = "Tank.Level",
                ExpressionFallback = 35,
                ExpressionMinimum = 0,
                ExpressionMaximum = 100,
                FillMinimum = 0,
                FillMaximum = 100,
                Direction = HmiFillDirection.Right
            }
        });
        layer.Items.Add(new HmiCircle
        {
            Id = "level",
            Name = "Level",
            Width = 50,
            Height = 50,
            BackgroundColor = HmiColor.FromArgb(255, 0, 200, 0),
            FillAnimation = new HmiFillAnimation
            {
                ExpressionFallback = 60,
                Direction = HmiFillDirection.Up
            }
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "background-image: linear-gradient(to right, #0080FF 0%, #0080FF 35%, transparent 35%, transparent 100%);");
        StringAssert.Contains(html, "fill=\"url(#hmi-fill-Level)\"");
        StringAssert.Contains(html, "<linearGradient id=\"hmi-fill-Level\" x1=\"0%\" y1=\"100%\" x2=\"0%\" y2=\"0%\"");
        StringAssert.Contains(html, "<stop offset=\"60%\" stop-color=\"#00C800\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersShapeFillPatterns()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiRectangle
        {
            Name = "CheckedTank",
            Width = 100,
            Height = 50,
            BackgroundColor = HmiColor.FromArgb(255, 255, 255, 255),
            PatternColor = HmiColor.FromArgb(255, 0, 0, 0),
            FillPattern = HmiFillPattern.Checkers
        });
        layer.Items.Add(new HmiCircle
        {
            Name = "StripedLevel",
            Width = 50,
            Height = 50,
            BackgroundColor = HmiColor.FromArgb(255, 255, 255, 255),
            PatternColor = HmiColor.FromArgb(255, 0, 128, 255),
            FillPattern = HmiFillPattern.Horizontal
        });
        layer.Items.Add(new HmiButton
        {
            Name = "CheckedButton",
            Width = 80,
            Height = 30,
            BackgroundColor = HmiColor.FromArgb(255, 255, 255, 255),
            PatternColor = HmiColor.FromArgb(255, 255, 0, 0),
            FillPattern = HmiFillPattern.Checkers
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "background-image: conic-gradient(#000000 25%, transparent 0 50%, #000000 0 75%, transparent 0);");
        StringAssert.Contains(html, "fill=\"url(#hmi-pattern-StripedLevel)\"");
        StringAssert.Contains(html, "<pattern id=\"hmi-pattern-StripedLevel\" patternUnits=\"userSpaceOnUse\"");
        StringAssert.Contains(html, "stroke=\"#0080FF\"");
        StringAssert.Contains(html, "background-image: conic-gradient(#FF0000 25%, transparent 0 50%, #FF0000 0 75%, transparent 0);");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersExtendedFillPatterns()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiRectangle
        {
            Name = "LargeBoxes",
            Width = 100,
            Height = 50,
            BackgroundColor = HmiColor.FromArgb(255, 255, 255, 255),
            PatternColor = HmiColor.FromArgb(255, 0, 0, 0),
            FillPattern = HmiFillPattern.LargeBoxes
        });
        layer.Items.Add(new HmiCircle
        {
            Name = "Ovals",
            Width = 50,
            Height = 50,
            BackgroundColor = HmiColor.FromArgb(255, 255, 255, 255),
            PatternColor = HmiColor.FromArgb(255, 0, 128, 255),
            FillPattern = HmiFillPattern.Ovals
        });
        layer.Items.Add(new HmiButton
        {
            Name = "WideDiagonal",
            Width = 80,
            Height = 30,
            BackgroundColor = HmiColor.FromArgb(255, 255, 255, 255),
            PatternColor = HmiColor.FromArgb(255, 255, 0, 0),
            FillPattern = HmiFillPattern.WideDiagonalRightToLeft
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "background-image: linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px);");
        StringAssert.Contains(html, "background-size: 12px 12px;");
        StringAssert.Contains(html, "<pattern id=\"hmi-pattern-Ovals\"");
        StringAssert.Contains(html, "width=\"12\" height=\"12\"");
        StringAssert.Contains(html, "<ellipse");
        StringAssert.Contains(html, "background-image: repeating-linear-gradient(45deg, #FF0000 0 2px, transparent 2px 6px);");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersScreenFillPattern()
    {
        var screen = new HmiScreen
        {
            Id = "main",
            Name = "Main",
            Width = 320,
            Height = 200,
            BackgroundColor = HmiColor.FromArgb(255, 255, 255, 255),
            PatternColor = HmiColor.FromArgb(255, 0, 64, 128),
            FillPattern = HmiFillPattern.Checkers
        };

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "background-color: #FFFFFF;");
        StringAssert.Contains(html, "background-image: conic-gradient(#004080 25%, transparent 0 50%, #004080 0 75%, transparent 0);");
        StringAssert.Contains(html, "background-size: 8px 8px;");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersScreenBackgroundImage()
    {
        var screen = new HmiScreen
        {
            Name = "BackgroundScreen",
            Width = 320,
            Height = 240,
            BackgroundImage = new HmiImageSource
            {
                ImageName = "background.svg",
                Uri = "data:image/svg+xml;base64,PHN2Zy8+"
            },
            BackgroundImageLayout = HmiBackgroundImageLayout.Tile
        };

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "data-background-image=\"background.svg\"");
        StringAssert.Contains(html, "data-background-image-layout=\"Tile\"");
        StringAssert.Contains(html, "background-image: url(&quot;data:image/svg+xml;base64,PHN2Zy8+&quot;);");
        StringAssert.Contains(html, "background-repeat: repeat;background-size: auto;");
    }

    [TestMethod]
    public async Task ConvertAsync_ScalesScreenFillPatternWithViewport()
    {
        var screen = new HmiScreen
        {
            Name = "StretchPattern",
            Width = 320,
            Height = 200,
            PatternColor = HmiColor.FromArgb(255, 0, 64, 128),
            FillPattern = HmiFillPattern.Checkers,
            FillPatternAlignment = HmiFillPatternAlignment.StretchToViewport
        };

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "data-fill-pattern-alignment=\"StretchToViewport\"");
        StringAssert.Contains(html, "background-size: 2.5% 4%;");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersConfiguredColorGradients()
    {
        var screen = new HmiScreen
        {
            Id = "main",
            Name = "GradientScreen",
            Width = 320,
            Height = 200,
            BackgroundColor = HmiColor.FromArgb(255, 34, 34, 34),
            FirstGradientColor = HmiColor.FromArgb(255, 17, 17, 17),
            FirstGradientOffset = 25,
            MiddleGradientColor = HmiColor.FromArgb(255, 34, 34, 34),
            SecondGradientColor = HmiColor.FromArgb(255, 51, 51, 51),
            SecondGradientOffset = 75,
            UseFirstGradient = true,
            UseSecondGradient = true,
            GradientDirection = HmiGradientDirection.VerticalFromTop
        };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiRectangle
        {
            Name = "GradientRectangle",
            Width = 100,
            Height = 50,
            BackgroundColor = HmiColor.FromArgb(255, 0, 128, 0),
            FirstGradientColor = HmiColor.FromArgb(255, 0, 255, 0),
            FirstGradientOffset = 40,
            UseFirstGradient = true,
            GradientDirection = HmiGradientDirection.HorizontalFromRight
        });
        layer.Items.Add(new HmiCircle
        {
            Name = "GradientCircle",
            Width = 50,
            Height = 50,
            BackgroundColor = HmiColor.FromArgb(255, 0, 0, 128),
            SecondGradientColor = HmiColor.FromArgb(255, 0, 128, 255),
            SecondGradientOffset = 60,
            UseSecondGradient = true,
            GradientDirection = HmiGradientDirection.DiagonalUp
        });
        layer.Items.Add(new HmiButton
        {
            Name = "GradientButton",
            Width = 80,
            Height = 30,
            BackgroundColor = HmiColor.FromArgb(255, 128, 0, 0),
            SecondGradientColor = HmiColor.FromArgb(255, 255, 128, 0),
            SecondGradientOffset = 30,
            UseSecondGradient = true
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "background-image: linear-gradient(to bottom, #111111 0%, #222222 25%, #222222 75%, #333333 100%);");
        StringAssert.Contains(html, "background-image: linear-gradient(to left, #00FF00 0%, #008000 40%, #008000 100%);");
        StringAssert.Contains(html, "fill=\"url(#hmi-color-gradient-GradientCircle)\"");
        StringAssert.Contains(html, "<linearGradient id=\"hmi-color-gradient-GradientCircle\" x1=\"0%\" y1=\"100%\" x2=\"100%\" y2=\"0%\"");
        StringAssert.Contains(html, "<stop offset=\"60%\" stop-color=\"#000080\"");
        StringAssert.Contains(html, "background-image: linear-gradient(to right, #800000 0%, #800000 30%, #FF8000 100%);");
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
    public async Task ConvertAsync_RendersPaintedItemForegroundFlashing()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiText
        {
            Name = "FlashingText",
            Text = HmiMultilingualText.FromText("Alarm"),
            ForegroundColor = HmiProperty.Blink(
                HmiColor.FromArgb(255, 1, 2, 3),
                HmiColor.FromArgb(255, 4, 5, 6),
                HmiBlinkRate.Fast)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "--hmi-foreground-color-off: #010203;");
        StringAssert.Contains(html, "--hmi-foreground-color-on: #040506;");
        StringAssert.Contains(html, "animation: hmi-foreground-color-flash 0.5s steps(1, end) infinite;");
        StringAssert.Contains(html, "@keyframes hmi-foreground-color-flash");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersPaintedItemBackgroundFlashing()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiRectangle
        {
            Name = "FlashingRectangle",
            Width = 100,
            Height = 40,
            BackgroundColor = HmiProperty.Blink(
                HmiColor.FromArgb(255, 10, 20, 30),
                HmiColor.FromArgb(255, 40, 50, 60),
                HmiBlinkRate.Slow)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "--hmi-background-color-off: #0A141E;");
        StringAssert.Contains(html, "--hmi-background-color-on: #28323C;");
        StringAssert.Contains(html, "animation: hmi-background-color-flash 2s steps(1, end) infinite;");
        StringAssert.Contains(html, "@keyframes hmi-background-color-flash");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersSvgBorderFlashing()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiCircle
        {
            Name = "FlashingBorder",
            Width = 100,
            Height = 40,
            BorderColor = HmiProperty.Blink(
                HmiColor.FromArgb(255, 1, 2, 3),
                HmiColor.FromArgb(255, 4, 5, 6),
                HmiBlinkRate.Fast),
            BorderWidth = 2
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "stroke=\"#010203\"");
        StringAssert.Contains(html, "--hmi-border-color-off: #010203;");
        StringAssert.Contains(html, "--hmi-border-color-on: #040506;");
        StringAssert.Contains(html, "animation: hmi-border-color-flash 0.5s steps(1, end) infinite;");
        StringAssert.Contains(html, "@keyframes hmi-border-color-flash");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersSvgFillFlashing()
    {
        var screen = new HmiScreen { Id = "main", Name = "Main" };
        var layer = new HmiLayer { Id = "default", Name = "Default" };
        layer.Items.Add(new HmiCircle
        {
            Name = "FlashingFill",
            Width = 100,
            Height = 40,
            BackgroundColor = HmiProperty.Blink(
                HmiColor.FromArgb(255, 10, 20, 30),
                HmiColor.FromArgb(255, 40, 50, 60),
                HmiBlinkRate.Slow)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "fill=\"#0A141E\"");
        StringAssert.Contains(html, "--hmi-background-color-off: #0A141E;");
        StringAssert.Contains(html, "--hmi-background-color-on: #28323C;");
        StringAssert.Contains(html, "animation: hmi-background-color-flash 2s steps(1, end) infinite;");
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

        StringAssert.Contains(html, "<style>*,*::before,*::after{box-sizing:border-box;}");
        StringAssert.Contains(html, "@keyframes hmi-symbolic-base-flash");
        StringAssert.Contains(html, "<script type=\"module\">");
        StringAssert.Contains(html, "customElements.define(\"node-projects-svghmi\"");
        Assert.AreEqual(1, CountOccurrences(html, "<style>*,*::before,*::after{box-sizing:border-box;}"));
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
    public async Task ConvertAsync_RendersTrendConfigurationForWebComponent()
    {
        var screen = new HmiScreen { Name = "Main", Width = 400, Height = 240 };
        var layer = new HmiLayer { Name = "Default" };
        var trend = new HmiTrendControl
        {
            Name = "ProcessTrend",
            Width = 320,
            Height = 180,
            ChartTitle = "Pressure & temperature",
            DisplayChartTitle = true,
            Resizable = true,
            Movable = false,
            Closeable = false,
            ContentFont = new HmiFont
            {
                Name = "Arial",
                Size = 9,
                Weight = 400
            },
            HeaderFont = new HmiFont
            {
                Name = "Siemens Sans",
                Size = 11,
                Weight = 700,
                Italic = true
            },
            ShowToolbar = true,
            ToolbarAlignment = HmiVerticalAlignment.Bottom,
            UseToolbarBackgroundColor = true,
            ToolbarBackgroundColor = HmiColor.FromArgb(255, 0x44, 0x33, 0x22),
            ToolbarButtonSize = 42,
            ShowStatusBar = true,
            UseStatusBarBackgroundColor = true,
            StatusBarBackgroundColor = HmiColor.FromArgb(255, 16, 32, 48),
            StatusBarForegroundColor = HmiColor.FromArgb(255, 224, 208, 192),
            StatusBarFont = new HmiFont
            {
                Name = "Tahoma",
                Size = 8,
                Weight = 600,
                Italic = true
            },
            DisplayPenIcons = true,
            UseTrendNameAsLabel = false,
            DisplayValueBar = true,
            DisplayMilliseconds = true,
            XAxisDateFormat = "dd.MMM.yyyy",
            WindowBackgroundColor = HmiColor.FromArgb(255, 0x12, 0x34, 0x56),
            XAxisInTrendColor = true,
            YAxisInTrendColor = false,
            UseGraphicValueBar = true,
            ValueBarColor = HmiColor.FromArgb(255, 0x65, 0x43, 0x21),
            ValueBarWidth = 3,
            ShowValueBarInXAxis = true,
            DisplayStatisticRulers = true,
            UseGraphicStatisticRulers = true,
            StatisticRulerColor = HmiColor.FromArgb(255, 0x22, 0xAA, 0x66),
            StatisticRulerWidth = 4,
            DisplayScrollMechanism = true,
            ChartLiveMode = true,
            AutoScale = false,
            XAxisScaleVisible = true,
            XAxisColor = HmiColor.FromArgb(255, 0x11, 0x22, 0x33),
            XAxisAlignment = HmiVerticalAlignment.Top,
            XAxisLabel = "Recorded time",
            XAxisDateVisible = false,
            XAxisFlipped = true,
            TimeFormat = HmiTrendTimeFormat.TwentyFourHour,
            XAxisTimeSpan = 120000,
            XAxisTimeSpanUnit = "Milliseconds",
            XAxisGridVisible = true,
            MajorGridVisible = true,
            MajorGridColor = HmiColor.FromArgb(255, 0x20, 0x40, 0x60),
            MinorGridVisible = false,
            MinorGridColor = HmiColor.FromArgb(255, 0x80, 0x90, 0xA0),
            GridInTrendColor = true,
            YAxisScaleVisible = true,
            YAxisColor = HmiColor.FromArgb(255, 0x44, 0x55, 0x66),
            YAxisAlignment = HmiHorizontalAlignment.Right,
            YAxisLabel = "Pressure (bar)",
            YAxisGridVisible = false,
            ShowPercentageAxis = true,
            PercentageAxisColor = HmiColor.FromArgb(255, 0x12, 0x34, 0x56),
            PercentageAxisAlignment = HmiHorizontalAlignment.Right,
            MinimumValue = -5,
            MaximumValue = 100,
            YAxisDecimalPlaces = 2
        };
        trend.Pens.Add(new HmiTrendPen
        {
            Number = 1,
            Name = "Pressure \"A\"",
            Label = "Vessel pressure",
            Color = HmiColor.FromArgb(255, 17, 34, 51),
            Visible = true,
            Width = 3,
            LineType = HmiTrendLineType.Stepped,
            Style = HmiLineStyle.Dash,
            FillVisible = true,
            FillColor = HmiColor.FromArgb(255, 0x33, 0x66, 0x99),
            LowerLimitColoring = true,
            LowerLimitValue = 10,
            LowerLimitColor = HmiColor.FromArgb(255, 0x00, 0x44, 0xCC),
            UpperLimitColoring = true,
            UpperLimitValue = 90,
            UpperLimitColor = HmiColor.FromArgb(255, 0xCC, 0x22, 0x11),
            UncertainColoring = true,
            UncertainColor = HmiColor.FromArgb(255, 0x88, 0x44, 0xCC),
            ShowAlarms = true,
            ValueAlignment = HmiVerticalAlignment.Bottom,
            Marker = "2",
            MarkerColor = HmiColor.FromArgb(255, 0xAA, 0xBB, 0xCC),
            MarkerSize = 5,
            MinimumValue = 0,
            MaximumValue = 100,
            AxisScaleType = HmiTrendAxisScaleType.Logarithmic,
            ExponentialFormat = true,
            AutoDecimalPlaces = true,
            EngineeringUnit = "bar"
        });
        layer.Items.Add(trend);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<hmi-trend-control id=\"ProcessTrend\"");
        StringAssert.Contains(html, "chart-title=\"Pressure &amp; temperature\"");
        StringAssert.Contains(html, "display-chart-title=\"true\"");
        StringAssert.Contains(html, "data-window-resizable=\"true\"");
        StringAssert.Contains(html, "data-window-movable=\"false\"");
        StringAssert.Contains(html, "data-window-closeable=\"false\"");
        StringAssert.Contains(html, "resize: both;");
        StringAssert.Contains(html, "--hmi-trend-content-font-family: Arial;--hmi-trend-content-font-size: 9px;--hmi-trend-content-font-weight: 400;");
        StringAssert.Contains(html, "--hmi-trend-header-font-family: Siemens Sans;--hmi-trend-header-font-size: 11px;--hmi-trend-header-font-weight: 700;--hmi-trend-header-font-style: italic;");
        StringAssert.Contains(html, "show-toolbar=\"true\"");
        StringAssert.Contains(html, "toolbar-alignment=\"Bottom\"");
        StringAssert.Contains(html, "use-toolbar-background-color=\"true\"");
        StringAssert.Contains(html, "toolbar-background-color=\"#443322\"");
        StringAssert.Contains(html, "--hmi-trend-toolbar-background: #443322;");
        StringAssert.Contains(html, "toolbar-button-size=\"42\"");
        StringAssert.Contains(html, "--hmi-trend-toolbar-button-size: 42px;");
        StringAssert.Contains(html, "show-status-bar=\"true\"");
        StringAssert.Contains(html, "use-status-bar-background-color=\"true\"");
        StringAssert.Contains(html, "--hmi-trend-status-background: #102030;");
        StringAssert.Contains(html, "--hmi-trend-status-foreground: #E0D0C0;");
        StringAssert.Contains(html, "--hmi-trend-status-font-family: Tahoma;--hmi-trend-status-font-size: 8px;--hmi-trend-status-font-weight: 600;--hmi-trend-status-font-style: italic;");
        StringAssert.Contains(html, "display-pen-icons=\"true\"");
        StringAssert.Contains(html, "use-trend-name-as-label=\"false\"");
        StringAssert.Contains(html, "display-value-bar=\"true\"");
        StringAssert.Contains(html, "display-milliseconds=\"true\"");
        StringAssert.Contains(html, "x-axis-date-format=\"dd.MMM.yyyy\"");
        StringAssert.Contains(html, "window-background-color=\"#123456\"");
        StringAssert.Contains(html, "x-axis-in-trend-color=\"true\"");
        StringAssert.Contains(html, "y-axis-in-trend-color=\"false\"");
        StringAssert.Contains(html, "use-graphic-value-bar=\"true\"");
        StringAssert.Contains(html, "value-bar-color=\"#654321\"");
        StringAssert.Contains(html, "value-bar-width=\"3\"");
        StringAssert.Contains(html, "show-value-bar-in-x-axis=\"true\"");
        StringAssert.Contains(html, "display-statistic-rulers=\"true\"");
        StringAssert.Contains(html, "use-graphic-statistic-rulers=\"true\"");
        StringAssert.Contains(html, "statistic-ruler-color=\"#22AA66\"");
        StringAssert.Contains(html, "statistic-ruler-width=\"4\"");
        StringAssert.Contains(html, "--hmi-trend-value-bar-color: #654321;");
        StringAssert.Contains(html, "--hmi-trend-value-bar-width: 3px;");
        StringAssert.Contains(html, "display-scroll-mechanism=\"true\"");
        StringAssert.Contains(html, "chart-live-mode=\"true\"");
        StringAssert.Contains(html, "auto-scale=\"false\"");
        StringAssert.Contains(html, "x-axis-scale-visible=\"true\"");
        StringAssert.Contains(html, "x-axis-color=\"#112233\"");
        StringAssert.Contains(html, "--hmi-trend-x-axis-color: #112233;");
        StringAssert.Contains(html, "x-axis-alignment=\"Top\"");
        StringAssert.Contains(html, "x-axis-label=\"Recorded time\"");
        StringAssert.Contains(html, "x-axis-date-visible=\"false\"");
        StringAssert.Contains(html, "x-axis-flipped=\"true\"");
        StringAssert.Contains(html, "time-format=\"TwentyFourHour\"");
        StringAssert.Contains(html, "x-axis-time-span=\"120000\"");
        StringAssert.Contains(html, "x-axis-time-span-unit=\"Milliseconds\"");
        StringAssert.Contains(html, "x-axis-grid-visible=\"true\"");
        StringAssert.Contains(html, "major-grid-visible=\"true\"");
        StringAssert.Contains(html, "major-grid-color=\"#204060\"");
        StringAssert.Contains(html, "minor-grid-visible=\"false\"");
        StringAssert.Contains(html, "minor-grid-color=\"#8090A0\"");
        StringAssert.Contains(html, "grid-in-trend-color=\"true\"");
        StringAssert.Contains(html, "--hmi-trend-major-grid-color: #204060;");
        StringAssert.Contains(html, "--hmi-trend-minor-grid-color: #8090A0;");
        StringAssert.Contains(html, "y-axis-scale-visible=\"true\"");
        StringAssert.Contains(html, "y-axis-color=\"#445566\"");
        StringAssert.Contains(html, "--hmi-trend-y-axis-color: #445566;");
        StringAssert.Contains(html, "y-axis-alignment=\"Right\"");
        StringAssert.Contains(html, "y-axis-label=\"Pressure (bar)\"");
        StringAssert.Contains(html, "y-axis-grid-visible=\"false\"");
        StringAssert.Contains(html, "show-percentage-axis=\"true\"");
        StringAssert.Contains(html, "percentage-axis-color=\"#123456\"");
        StringAssert.Contains(html, "percentage-axis-alignment=\"Right\"");
        StringAssert.Contains(html, "--hmi-trend-percentage-axis-color: #123456;");
        StringAssert.Contains(html, "minimum-value=\"-5\"");
        StringAssert.Contains(html, "maximum-value=\"100\"");
        StringAssert.Contains(html, "y-axis-decimal-places=\"2\"");
        StringAssert.Contains(html, "pens=\"[{&quot;number&quot;:1,&quot;name&quot;:&quot;Pressure \\&quot;A\\&quot;&quot;,&quot;label&quot;:&quot;Vessel pressure&quot;,&quot;color&quot;:&quot;#112233&quot;,&quot;visible&quot;:true,&quot;width&quot;:3,&quot;lineType&quot;:2,&quot;style&quot;:1,&quot;fill&quot;:true,&quot;fillColor&quot;:&quot;#336699&quot;,&quot;lowerLimitColoring&quot;:true,&quot;lowerLimit&quot;:10,&quot;lowerLimitColor&quot;:&quot;#0044CC&quot;,&quot;upperLimitColoring&quot;:true,&quot;upperLimit&quot;:90,&quot;upperLimitColor&quot;:&quot;#CC2211&quot;,&quot;uncertainColoring&quot;:true,&quot;uncertainColor&quot;:&quot;#8844CC&quot;,&quot;showAlarms&quot;:true,&quot;valueAlignment&quot;:&quot;Bottom&quot;,&quot;marker&quot;:&quot;2&quot;,&quot;markerColor&quot;:&quot;#AABBCC&quot;,&quot;markerSize&quot;:5,&quot;minimum&quot;:0,&quot;maximum&quot;:100,&quot;axisScaleType&quot;:1,&quot;exponentialFormat&quot;:true,&quot;autoDecimalPlaces&quot;:true,&quot;unit&quot;:&quot;bar&quot;}]\"");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersPerPenDecimalPlaces()
    {
        var screen = new HmiScreen { Name = "Main", Width = 400, Height = 240 };
        var layer = new HmiLayer { Name = "Default" };
        var trend = new HmiTrendControl { Name = "Trend", Width = 320, Height = 180, TimeBase = HmiTrendTimeBase.Project, ProjectTimeZoneId = "Europe/Berlin" };
        trend.TimeAxes.Add(new HmiTrendTimeAxis
        {
            Name = "Time A", TrendWindowName = "Time window", Visible = false, ShowDate = true, DateFormat = "yyyy/MM/dd",
            TimeFormat = HmiTrendTimeFormat.TwentyFourHour, DisplayMilliseconds = true,
            TimeSpan = 120000, TimeSpanUnit = "Milliseconds", Alignment = HmiVerticalAlignment.Top,
            Color = HmiColor.FromArgb(255, 0x12, 0x34, 0x56), InTrendColor = false, Label = "Recorded time"
        });
        trend.TimeAxes.Add(new HmiTrendTimeAxis { Name = "Time B", Visible = true, Alignment = HmiVerticalAlignment.Bottom, Label = "Second time axis",
            RangeType = HmiTrendTimeRangeType.StartEnd, StartTime = new DateTimeOffset(2018, 7, 19, 8, 51, 13, TimeSpan.Zero),
            EndTime = new DateTimeOffset(2018, 7, 19, 8, 52, 13, TimeSpan.Zero), MeasurementPoints = 120, RefreshEnabled = false });
        trend.TimeAxes.Add(new HmiTrendTimeAxis { Name = "Time C", Visible = true, Alignment = HmiVerticalAlignment.Bottom });
        trend.TrendWindows.Add(new HmiTrendWindow
        {
            Name = "Window A", Visible = false, SpacePortion = 3, XAxisGridVisible = false,
            MajorGridColor = HmiColor.FromArgb(255, 0x12, 0x34, 0x56), ValueBarWidth = 4
        });
        trend.ValueAxes.Add(new HmiTrendValueAxis
        {
            Name = "Unused", Label = "Standalone", MinimumValue = 5, MaximumValue = 15,
            TrendWindowName = "Axis window",
            DecimalPlaces = 1, Visible = true, Alignment = HmiHorizontalAlignment.Left
        });
        trend.ValueAxes.Add(new HmiTrendValueAxis { Name = "Second value", Visible = true, Alignment = HmiHorizontalAlignment.Left });
        trend.Pens.Add(new HmiTrendPen
        {
            Number = 1, DecimalPlaces = 4, ValueAxisName = "Axis A", ValueAxisVisible = false,
            TrendWindowName = "Pen window", TimeAxisName = "Time A",
            ValueAxisColor = HmiColor.FromArgb(255, 0x12, 0x34, 0x56), ValueAxisInTrendColor = true,
            ValueAxisAlignment = HmiHorizontalAlignment.Right, ValueAxisLabel = "Pressure"
        });
        layer.Items.Add(trend);
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html, "&quot;decimalPlaces&quot;:4");
        StringAssert.Contains(html, "value-axes=\"");
        StringAssert.Contains(html, "trend-windows=\"");
        StringAssert.Contains(html, "time-axes=\"");
        StringAssert.Contains(html, "&quot;dateFormat&quot;:&quot;yyyy/MM/dd&quot;");
        StringAssert.Contains(html, "&quot;timeSpan&quot;:120000");
        StringAssert.Contains(html, "&quot;spacePortion&quot;:3");
        StringAssert.Contains(html, "&quot;majorGridColor&quot;:&quot;#123456&quot;");
        StringAssert.Contains(html, "&quot;valueAxisName&quot;:&quot;Unused&quot;");
        StringAssert.Contains(html, "&quot;valueAxisLabel&quot;:&quot;Standalone&quot;");
        StringAssert.Contains(html, "&quot;trendWindowName&quot;:&quot;Axis window&quot;");
        StringAssert.Contains(html, "&quot;trendWindowName&quot;:&quot;Time window&quot;");
        StringAssert.Contains(html, "&quot;name&quot;:&quot;Time B&quot;");
        StringAssert.Contains(html, "&quot;label&quot;:&quot;Second time axis&quot;");
        StringAssert.Contains(html, "&quot;rangeType&quot;:&quot;StartEnd&quot;");
        StringAssert.Contains(html, "&quot;startTime&quot;:&quot;2018-07-19T08:51:13.0000000+00:00&quot;");
        StringAssert.Contains(html, "&quot;endTime&quot;:&quot;2018-07-19T08:52:13.0000000+00:00&quot;");
        StringAssert.Contains(html, "&quot;measurementPoints&quot;:120");
        StringAssert.Contains(html, "&quot;refreshEnabled&quot;:false");
        StringAssert.Contains(html, "time-base=\"Project\"");
        StringAssert.Contains(html, "project-time-zone=\"Europe/Berlin\"");
        StringAssert.Contains(html, "&quot;name&quot;:&quot;Time A&quot;");
        StringAssert.Contains(html, "&quot;name&quot;:&quot;Time C&quot;");
        StringAssert.Contains(html, "&quot;valueAxisName&quot;:&quot;Second value&quot;");
        Assert.IsTrue(html.IndexOf("&quot;name&quot;:&quot;Time A&quot;", StringComparison.Ordinal) < html.IndexOf("&quot;name&quot;:&quot;Time B&quot;", StringComparison.Ordinal));
        Assert.IsTrue(html.IndexOf("&quot;name&quot;:&quot;Time B&quot;", StringComparison.Ordinal) < html.IndexOf("&quot;name&quot;:&quot;Time C&quot;", StringComparison.Ordinal));
        Assert.IsTrue(html.IndexOf("&quot;valueAxisName&quot;:&quot;Unused&quot;", StringComparison.Ordinal) < html.IndexOf("&quot;valueAxisName&quot;:&quot;Second value&quot;", StringComparison.Ordinal));
        StringAssert.Contains(html, "&quot;trendWindowName&quot;:&quot;Pen window&quot;");
        StringAssert.Contains(html, "&quot;timeAxisName&quot;:&quot;Time A&quot;");
        StringAssert.Contains(html, "&quot;valueAxisName&quot;:&quot;Axis A&quot;");
        StringAssert.Contains(html, "&quot;valueAxisVisible&quot;:false");
        StringAssert.Contains(html, "&quot;valueAxisColor&quot;:&quot;#123456&quot;");
        StringAssert.Contains(html, "&quot;valueAxisInTrendColor&quot;:true");
        StringAssert.Contains(html, "&quot;valueAxisAlignment&quot;:&quot;Right&quot;");
        StringAssert.Contains(html, "&quot;valueAxisLabel&quot;:&quot;Pressure&quot;");
    }

    [TestMethod]
    public async Task ConvertAsync_DoesNotRenderDisabledTrendStatusBarBackground()
    {
        var screen = new HmiScreen { Name = "Main", Width = 400, Height = 240 };
        var layer = new HmiLayer { Name = "Default" };
        layer.Items.Add(new HmiTrendControl
        {
            Name = "Trend",
            Width = 320,
            Height = 180,
            ShowStatusBar = true,
            UseStatusBarBackgroundColor = false,
            StatusBarBackgroundColor = HmiColor.FromArgb(255, 0x10, 0x20, 0x30)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "use-status-bar-background-color=\"false\"");
        Assert.IsFalse(html.Contains("--hmi-trend-status-background:", StringComparison.Ordinal));
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
            Image = new HmiImageSource { ImageId = "running-image" },
            BackgroundColor = HmiColor.FromArgb(255, 10, 20, 30),
            CaptionColor = HmiColor.FromArgb(255, 240, 241, 242),
            BorderColor = HmiColor.FromArgb(255, 100, 101, 102)
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
        StringAssert.Contains(html, "background-color: #0A141E;");
        StringAssert.Contains(html, "color: #F0F1F2;");
        StringAssert.Contains(html, "border-color: #646566;");
        Assert.DoesNotContain(">Default</button>", html);
    }

    [TestMethod]
    public async Task ConvertAsync_RendersButtonThreeDBorder()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiButton
        {
            Name = "BeveledButton",
            Width = 100,
            Height = 30,
            Text = HmiMultilingualText.FromText("Start"),
            ThreeDBorderWidth = 3,
            ThreeDBorderTopColor = HmiColor.FromArgb(255, 238, 238, 238),
            ThreeDBorderBottomColor = HmiColor.FromArgb(255, 64, 64, 64)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<button id=\"BeveledButton\"");
        StringAssert.Contains(html, "border-style: solid;border-width: 3px;");
        StringAssert.Contains(html, "border-color: #EEEEEE #404040 #404040 #EEEEEE;");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersButtonCaptionColor()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiButton
        {
            Name = "ColoredCaption",
            Width = 100,
            Height = 30,
            Text = HmiMultilingualText.FromText("Start"),
            CaptionColor = HmiColor.FromArgb(255, 12, 34, 56)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "<button id=\"ColoredCaption\"");
        StringAssert.Contains(html, "color: #0C2238;");
    }

    [TestMethod]
    public async Task ConvertAsync_RendersBlinkingButtonCaptionColor()
    {
        var screen = new HmiScreen { Name = "MainScreen", Width = 320, Height = 240 };
        var layer = new HmiLayer { Name = "Layer 1" };
        layer.Items.Add(new HmiButton
        {
            Name = "FlashingCaption",
            Width = 100,
            Height = 30,
            Text = HmiMultilingualText.FromText("Alarm"),
            CaptionColor = HmiProperty.Blink(
                HmiColor.FromArgb(255, 12, 34, 56),
                HmiColor.FromArgb(255, 238, 68, 17),
                HmiBlinkRate.Fast)
        });
        screen.Layers.Add(layer);

        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);

        StringAssert.Contains(html, "--hmi-caption-color-off: #0C2238;");
        StringAssert.Contains(html, "--hmi-caption-color-on: #EE4411;");
        StringAssert.Contains(html, "animation: hmi-caption-color-flash 0.5s steps(1, end) infinite;");
        StringAssert.Contains(html, "@keyframes hmi-caption-color-flash");
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
