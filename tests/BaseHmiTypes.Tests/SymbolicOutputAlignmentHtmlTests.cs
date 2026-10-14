using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;

namespace BaseHmiTypes.Tests;

[TestClass]
public class SymbolicOutputAlignmentHtmlTests
{
    [TestMethod]
    public async Task ReadOnlySymbolicOutputHonorsConfiguredAlignment()
    {
        var field = new HmiSymbolicIOField { Name = "Status", ReadOnly = true, ShowDropDownButton = false,
            Value = 0, HorizontalAlignment = HmiHorizontalAlignment.Right, VerticalAlignment = HmiVerticalAlignment.Bottom };
        field.States.Add(new HmiState { Value = 0, Text = HmiMultilingualText.FromText("Idle") });
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(field);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html, "align-items: flex-end; justify-content: flex-end;");
        StringAssert.Contains(html, "role=\"status\"");
        StringAssert.Contains(html, "Idle");
    }
}
