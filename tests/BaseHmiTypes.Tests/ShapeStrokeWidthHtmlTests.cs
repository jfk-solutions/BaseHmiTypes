using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class ShapeStrokeWidthHtmlTests
{
    [TestMethod] [DataRow("Line")] [DataRow("Polyline")] [DataRow("Circle")]
    public async Task StrokeWidthUsesFiniteNonnegativeEffectiveValuesWithoutChangingSource(string kind)
    {
        HmiShapeBase shape = kind switch { "Polyline" => new HmiPolyline(), "Circle" => new HmiCircle(), _ => new HmiLine() };
        shape.Name = "Stroke"; shape.Width = 64; shape.Height = 32;
        if (shape is HmiPolyline points) { points.Points.Add(new(0,0)); points.Points.Add(new(64,32)); }
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(shape);
        var renderer = new HmiScreenToHtmlConverter();
        async Task Width(double expected)
        {
            var html = await renderer.ConvertAsync(screen);
            var svg = Regex.Match(html, "<svg\\b[^>]*id=\"Stroke\"[^>]*>.*?</svg>", RegexOptions.Singleline).Value;
            var element = Regex.Match(svg, kind switch { "Polyline" => "<polyline\\b[^>]*>", "Circle" => "<circle\\b[^>]*stroke-width[^>]*>", _ => "<line\\b[^>]*>" }).Value;
            StringAssert.Contains(element, $"stroke-width=\"{expected.ToString(System.Globalization.CultureInfo.InvariantCulture)}\"");
        }
        await Width(1);
        shape.BorderWidth = 4; await Width(4);
        foreach (var valid in new[] { 0d, 2.5, 7d })
        {
            shape.LineWidth = valid; await Width(valid); Assert.AreEqual(valid, shape.LineWidth.StaticValue);
        }
        foreach (var invalid in new[] { -1d, double.NaN, double.PositiveInfinity, double.NegativeInfinity })
        {
            var source = HmiProperty.Tag("Stroke.Width", invalid); shape.LineWidth = source; await Width(4);
            Assert.AreSame(source, shape.LineWidth); Assert.AreEqual(invalid, shape.LineWidth.StaticValue);
            foreach (var border in new[] { -2d, double.NaN, double.PositiveInfinity, double.NegativeInfinity })
            {
                shape.BorderWidth = border; await Width(1); Assert.AreEqual(border, shape.BorderWidth.StaticValue);
            }
            shape.BorderWidth = 0; await Width(0); shape.BorderWidth = 4;
        }
        shape.LineWidth = null; shape.BorderWidth = null; await Width(1);
    }
}
