using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;
[TestClass]
public class ButtonPressedHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var pressed in new[] { false, true })
        foreach (var toggle in new[] { false, true })
        foreach (var same in new[] { false, true })
        foreach (var alternate in new[] { false, true })
        foreach (var tagged in new[] { false, true }) yield return [pressed, toggle, same, alternate, tagged];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task RendersPressedSnapshot(bool pressed, bool toggle, bool same, bool alternate, bool tagged)
    {
        var button = CreateButton();
        button.Pressed = tagged ? HmiProperty.Tag("Button.Pressed", pressed) : HmiProperty.Static(pressed);
        button.Toggle = tagged ? HmiProperty.Tag("Button.Toggle", toggle) : HmiProperty.Static(toggle);
        button.DownStateSameAsUp = same;
        if (alternate) { button.AlternateImage = new HmiImageSource { Uri = "down.svg" }; button.AlternateText = HmiMultilingualText.FromText("Down"); }
        var content = await Convert(button);
        Assert.AreEqual(toggle, content.Contains("aria-pressed="));
        if (toggle) StringAssert.Contains(content, "aria-pressed=\"" + (pressed ? "true" : "false") + "\"");
        var down = pressed && !same;
        StringAssert.Contains(content, down && alternate ? "down.svg" : "up.svg");
        StringAssert.Contains(content, "aria-label=\"" + (down && alternate ? "Down" : "Up") + "\"");
        StringAssert.Contains(content, "box-shadow: inset 3px 0 0 " + (down ? "#404040" : "#EEEEEE"));
    }
    [TestMethod]
    [DataRow(false)]
    [DataRow(true)]
    public async Task ExplicitStateAndDisabledImageKeepPrecedence(bool disabled)
    {
        var button = CreateButton(); button.Pressed = true; button.Toggle = true;
        button.AlternateImage = new HmiImageSource { Uri = "down.svg" }; button.AlternateText = HmiMultilingualText.FromText("Down");
        button.State = 5; button.States.Add(new HmiState { Value = 5, Text = HmiMultilingualText.FromText("State"), Image = new HmiImageSource { Uri = "state.svg" } });
        button.Enabled = !disabled; button.ShowDisabledState = true; button.DisabledImageMode = HmiDisabledImageMode.Reference;
        button.DisabledImage = new HmiImageSource { Uri = "disabled.svg" };
        var content = await Convert(button);
        StringAssert.Contains(content, "aria-label=\"State\"");
        StringAssert.Contains(content, disabled ? "disabled.svg" : "state.svg");
        Assert.IsFalse(content.Contains("down.svg"));
    }
    private static HmiButton CreateButton() => new() { Name = "Pressed", Width = 100, Height = 100, Mode = HmiButtonType.GraphicAndText,
        Text = HmiMultilingualText.FromText("Up"), Image = new HmiImageSource { Uri = "up.svg" }, ThreeDBorderWidth = 3,
        ThreeDBorderTopColor = HmiColor.FromArgb(255, 238, 238, 238), ThreeDBorderBottomColor = HmiColor.FromArgb(255, 64, 64, 64) };
    private static async Task<string> Convert(HmiButton button)
    {
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(button); screen.Layers.Add(layer);
        return Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(screen), "<button id=\"Pressed\"[^>]*>.*?</button>").Value;
    }
}
