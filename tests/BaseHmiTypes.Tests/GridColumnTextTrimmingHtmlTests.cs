using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class GridColumnTextTrimmingHtmlTests
{
    [TestMethod]
    [DataRow("Alarm")]
    [DataRow("Detailed")]
    [DataRow("Overview")]
    [DataRow("Diagnosis")]
    public async Task HeaderTrimmingIsIndependentOfBodyAndSurvivesHiddenHeadings(string kind)
    {
        foreach (var mode in new int?[] { null, 0, 1, int.MinValue })
        {
            HmiControlWindowBase control = kind switch { "Alarm" => new HmiAlarmControl { ShortenColumnTitles = true }, "Detailed" => new HmiDetailedParameterControl { HideDetails = false }, "Overview" => new HmiOverviewParameterControl(), _ => new HmiSystemDiagnosisControl() };
            control.Name = "Control"; control.Width = 160; control.Height = 80;
            AddColumn(control, "Visible", "Caption <A>", mode, 37, true);
            AddColumn(control, "Hidden", "Hidden caption", 1, 0, false);
            var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(control); screen.Layers.Add(layer);
            var renderer = new HmiScreenToHtmlConverter();
            async Task<string> Html() => HtmlTestMarkup.WithoutScripts(await renderer.ConvertAsync(screen));
            var html = await Html();
            var table = Regex.Match(html, "<table class=\"hmi-(?:alarm|parameter|diagnosis)-table[^>]*>.*?</table>", RegexOptions.Singleline).Value;
            var header = Regex.Match(table, "<thead>.*?</thead>", RegexOptions.Singleline).Value;
            StringAssert.Contains(header, "Caption &lt;A&gt;");
            Assert.IsFalse(header.Contains("Hidden caption"));
            Assert.AreEqual(mode == 1, header.Contains("<span style=\"display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\">"));
            if (mode == 0) StringAssert.Contains(header, "overflow: visible;text-overflow: clip;white-space: normal;");
            if (mode != null) StringAssert.Contains(header, "data-header-text-trimming=\"" + mode.Value + "\"");
            StringAssert.Contains(header, "data-content-text-trimming=\"37\"");
            StringAssert.Contains(html, "class=\"hmi-grid-column-text-trimming\"");
            StringAssert.Contains(html, "data-column-index=\"1\" data-column-source-name=\"Hidden\" data-header-text-trimming=\"1\" data-content-text-trimming=\"0\"");
            Assert.IsFalse(Regex.Match(table, "<tbody>.*?</tbody>", RegexOptions.Singleline).Value.Contains("<span"));
            switch (control)
            {
                case HmiAlarmControl alarm: alarm.ShowHeader = false; break;
                case HmiParameterControlBase parameter: parameter.ColumnHeaderType = 0; break;
                case HmiSystemDiagnosisControl diagnosis: diagnosis.ShowColumnHeadings = false; break;
            }
            html = await Html();
            Assert.IsFalse(Regex.Match(html, "<table class=\"hmi-(?:alarm|parameter|diagnosis)-table[^>]*>.*?</table>", RegexOptions.Singleline).Value.Contains("<thead>"));
            StringAssert.Contains(html, "data-content-text-trimming=\"37\"");
            if (control is HmiDetailedParameterControl detailed) { detailed.HideDetails = true; StringAssert.Contains(await Html(), "data-content-text-trimming=\"37\""); }
        }
    }

    private static void AddColumn(HmiControlWindowBase control, string name, string caption, int? header, int? content, bool visible)
    {
        HmiProperty<int>? Header() => header is null ? null : header.Value;
        HmiProperty<int>? Content() => content is null ? null : content.Value;
        switch (control)
        {
            case HmiAlarmControl alarm: alarm.ColumnDefinitions.Add(new HmiAlarmColumn { SourceType = name, HeaderText = HmiMultilingualText.FromText(caption), HeaderTextTrimming = Header(), ContentTextTrimming = Content(), Visible = visible, Width = 40 }); break;
            case HmiParameterControlBase parameter: parameter.ColumnDefinitions.Add(new HmiParameterColumn { Name = name, HeaderText = HmiMultilingualText.FromText(caption), HeaderTextTrimming = Header(), ContentTextTrimming = Content(), Visible = visible, Width = 40 }); break;
            case HmiSystemDiagnosisControl diagnosis: diagnosis.ColumnDefinitions.Add(new HmiSystemDiagnosisColumn { SourceType = name, HeaderText = HmiMultilingualText.FromText(caption), HeaderTextTrimming = Header(), ContentTextTrimming = Content(), Visible = visible, Width = 40 }); break;
        }
    }
}
