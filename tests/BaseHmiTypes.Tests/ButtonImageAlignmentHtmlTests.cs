using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;
[TestClass]
public class ButtonImageAlignmentHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var x in Enum.GetValues<HmiHorizontalAlignment>())
        foreach (var y in Enum.GetValues<HmiVerticalAlignment>())
        foreach (var tagged in new[] { false, true }) yield return [x, y, tagged];
    }
    [TestMethod]
    [DynamicData(nameof(Cases))]
    public async Task ExportsIndependentAxes(HmiHorizontalAlignment x, HmiVerticalAlignment y, bool tagged)
    {
        var button = new HmiButton { Name = "Aligned", Image = new HmiImageSource { Uri = "picture.svg" },
            Text = HmiMultilingualText.FromText("Start"), Mode = HmiButtonType.GraphicAndText,
            ImageHorizontalAlignment = tagged ? HmiProperty.Tag("Button.X", x) : HmiProperty.Static(x),
            ImageVerticalAlignment = tagged ? HmiProperty.Tag("Button.Y", y) : HmiProperty.Static(y) };
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(button); screen.Layers.Add(layer);
        var content = Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(screen), "<button id=\"Aligned\"[^>]*>(.*?)</button>").Groups[1].Value;
        var cssX = x switch { HmiHorizontalAlignment.Left => "start", HmiHorizontalAlignment.Right => "end", HmiHorizontalAlignment.Center => "center", _ => "stretch" };
        var cssY = y switch { HmiVerticalAlignment.Top => "start", HmiVerticalAlignment.Bottom => "end", HmiVerticalAlignment.Center => "center", _ => "stretch" };
        StringAssert.Contains(content, "data-image-horizontal=\"" + cssX + "\"");
        StringAssert.Contains(content, "data-image-vertical=\"" + cssY + "\"");
        StringAssert.Contains(content, "justify-items: " + cssX + ";align-items: " + cssY + ";");
        StringAssert.Contains(content, "picture.svg"); StringAssert.Contains(content, "Start");
    }
}
