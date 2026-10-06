using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class TextLayoutHtmlTests
{
    [TestMethod]
    [DataRow("Text")]
    [DataRow("Label")]
    [DataRow("Button")]
    [DataRow("TextBox")]
    public async Task WrappingAndTrimmingRemainIndependentAndRetainFullText(string kind)
    {
        foreach (var (wrap, trim) in new (int?, int?)[] { (0, 1), (1, 0), (1, 1), (0, 0), (int.MinValue, 37), (null, 1), (null, null) })
        {
            HmiScreenItemBase item = kind switch { "Text" => new HmiText(), "Label" => new HmiLabel(), "Button" => new HmiButton(), _ => new HmiTextBox() };
            item.Name = "Sample"; item.Width = 80; item.Height = 40;
            var text = HmiMultilingualText.FromText("First <line>  spaced\nSecond & line");
            HmiProperty<int>? wrapping = wrap is null ? null : wrap.Value, trimming = trim is null ? null : trim.Value;
            if (item is HmiText shape) { shape.Text = text; shape.TextWrapping = wrapping; shape.TextTrimming = trimming; shape.HorizontalAlignment = HmiHorizontalAlignment.Right; shape.VerticalAlignment = HmiVerticalAlignment.Center; }
            else if (item is HmiButton button) { button.Text = text; button.TextWrapping = wrapping; button.TextTrimming = trimming; button.HorizontalAlignment = HmiHorizontalAlignment.Right; button.VerticalAlignment = HmiVerticalAlignment.Center; }
            else if (item is HmiTextWidgetBase widget) { widget.Text = text; widget.TextWrapping = wrapping; widget.TextTrimming = trimming; widget.HorizontalAlignment = HmiHorizontalAlignment.Right; widget.VerticalAlignment = HmiVerticalAlignment.Center; }
            var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(item); screen.Layers.Add(layer);
            var html = HtmlTestMarkup.WithoutScripts(await new HmiScreenToHtmlConverter().ConvertAsync(screen));
            StringAssert.Contains(html, "First &lt;line&gt;  spaced\nSecond &amp; line");
            if (wrap is not null) StringAssert.Contains(html, "data-text-wrapping=\"" + wrap.Value + "\"");
            if (trim is not null) StringAssert.Contains(html, "data-text-trimming=\"" + trim.Value + "\"");
            Assert.AreEqual(wrap == 0, html.Contains("white-space: pre;"));
            Assert.AreEqual(wrap == 1, html.Contains("white-space: pre-wrap;"));
            Assert.AreEqual(kind != "TextBox" && wrap == 0 && trim == 1, html.Contains("text-overflow: ellipsis;"));
            if (kind == "TextBox")
            {
                Assert.AreEqual(wrap == 0, html.Contains("wrap=\"off\""));
                Assert.AreEqual(wrap == 1, html.Contains("wrap=\"soft\""));
                Assert.IsFalse(html.Contains("data-hmi-text-content"));
            }
            else
            {
                Assert.AreEqual(wrap is 0 or 1 || trim == 0, html.Contains("data-hmi-text-content"));
                StringAssert.Contains(html, "text-align: right;");
                if (wrap is 0 or 1) StringAssert.Contains(html, "min-inline-size: 0;max-inline-size: 100%;overflow: hidden;");
            }
        }
    }

    [TestMethod]
    [DataRow(90)]
    [DataRow(270)]
    public async Task RotatedTextKeepsLogicalBoundsAndExistingSizing(int angle)
    {
        var item = new HmiText { Name = "Rotated", Width = 80, Height = 40, Text = HmiMultilingualText.FromText("Full caption"), TextWrapping = 0, TextTrimming = 1, Font = new HmiFont { OrientationAngle = angle }, AdaptBorderToContent = true, SizeToFit = true };
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(item); screen.Layers.Add(layer);
        var html = HtmlTestMarkup.WithoutScripts(await new HmiScreenToHtmlConverter().ConvertAsync(screen));
        StringAssert.Contains(html, angle == 90 ? "writing-mode: sideways-lr;" : "writing-mode: sideways-rl;");
        StringAssert.Contains(html, "max-inline-size: 100%;");
        StringAssert.Contains(html, "width: max-content;height: max-content;");
        StringAssert.Contains(html, "Full caption");
    }
}
