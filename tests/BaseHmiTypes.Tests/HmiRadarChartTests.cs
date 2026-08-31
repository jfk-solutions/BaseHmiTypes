using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;

namespace BaseHmiTypes.Tests;

[TestClass]
public sealed class HmiRadarChartTests
{
    [TestMethod]
    public void RetainsOrderedCategoriesSeriesAndTagOrConstantValues()
    {
        var chart = new HmiRadarChartControl();
        chart.Categories.Add(new HmiRadarChartCategory
        {
            Index = 1,
            Name = HmiMultilingualText.FromText("Temperature"),
            Minimum = 0,
            Maximum = 100
        });
        var series = new HmiRadarChartSeries
        {
            Index = 1,
            Name = HmiMultilingualText.FromText("Current"),
            LineAndMarker = "Line and circle",
            LineColor = HmiColor.FromArgb(255, 17, 34, 51),
            FillColor = HmiColor.FromArgb(128, 68, 85, 102)
        };
        series.DataPoints.Add(new HmiRadarChartDataPoint { CategoryIndex = 1, Tag = "{[PLC]Temperature}" });
        series.DataPoints.Add(new HmiRadarChartDataPoint { CategoryIndex = 2, ConstantValue = 42.5, SourceValue = "42.5" });
        chart.Series.Add(series);

        Assert.AreEqual("Temperature", chart.Categories[0].Name!.GetText(null));
        Assert.AreEqual(100, chart.Categories[0].Maximum!.StaticValue);
        Assert.AreEqual("Current", chart.Series[0].Name!.GetText(null));
        Assert.AreEqual("{[PLC]Temperature}", chart.Series[0].DataPoints[0].Tag);
        Assert.AreEqual(42.5, chart.Series[0].DataPoints[1].ConstantValue!.StaticValue);
    }
}
