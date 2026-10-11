using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Images;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;

[TestClass]
public class ParameterHeaderGraphicHtmlTests
{
    private const string Svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\"><rect width=\"10\" height=\"10\" fill=\"red\"/></svg>";
    private static string Uri => "data:image/svg+xml;base64," + Convert.ToBase64String(Encoding.UTF8.GetBytes(Svg));
    private sealed class Project(bool available) : HmiProjectBase
    {
        public int Calls { get; private set; }
        public override async ValueTask<HmiImage?> GetImageAsync(string id, CancellationToken cancellationToken = default)
        {
            Calls++; await Task.Yield(); cancellationToken.ThrowIfCancellationRequested();
            Assert.AreEqual("HeaderImage", id);
            return available ? new HmiImage { Id = id, MimeType = "image/svg+xml", Data = Encoding.UTF8.GetBytes(Svg) } : null;
        }
    }

    [TestMethod]
    [DataRow(false,null)] [DataRow(false,0)] [DataRow(false,1)] [DataRow(false,2)] [DataRow(false,3)] [DataRow(false,-1)] [DataRow(false,99)]
    [DataRow(true,null)] [DataRow(true,0)] [DataRow(true,1)] [DataRow(true,2)] [DataRow(true,3)] [DataRow(true,-1)] [DataRow(true,99)]
    public async Task HeaderModesResolveGraphicsAndKeepCaptionFallback(bool overview, int? mode)
    {
        foreach (var available in new[] { false, true }) foreach (var referenced in new[] { false, true })
        {
            HmiParameterControlBase control = overview ? new HmiOverviewParameterControl() : new HmiDetailedParameterControl();
            control.ColumnHeaderType = 2;
            var column = new HmiParameterColumn { Name = "Column", HeaderText = HmiMultilingualText.FromText("Caption <&>"), HeaderGraphicKey = "Graphic<&\"" };
            if (mode.HasValue) column.HeaderContentMode = mode.Value;
            if (referenced) column.HeaderGraphic = new HmiImageSource { ImageId = "HeaderImage" };
            else if (available) column.HeaderGraphic = new HmiImageSource { Uri = Uri };
            control.ColumnDefinitions.Add(column);
            var hidden = new HmiParameterColumn { Name = "Hidden", Visible = false, HeaderContentMode = 3, HeaderGraphicKey = "" };
            control.ColumnDefinitions.Add(hidden);
            var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(control);
            var project = new Project(available);
            var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, project);
            var heading = Regex.Match(html,"<th scope=\"col\"[\\s\\S]*?</th>").Value;
            var graphicMode = mode is 0 or 1 or 3;
            Assert.AreEqual(available && graphicMode, heading.Contains("data-parameter-header-graphic=\"true\""));
            Assert.AreEqual(mode != 3 && (mode != 0 || !available), heading.Contains("Caption &lt;&amp;&gt;"));
            if (available && graphicMode) StringAssert.Contains(heading,$"src=\"{Uri}\"");
            Assert.AreEqual(mode == 3 && !available, heading.Contains("data-parameter-header-graphic-unloaded="));
            Assert.AreEqual(referenced && graphicMode ? 1 : 0,project.Calls);
            var metadata = Regex.Matches(html,"<div hidden data-parameter-column-header-definition[^>]*>");
            Assert.AreEqual(2,metadata.Count); StringAssert.Contains(metadata[1].Value,"data-header-graphic-key=\"\"");
            StringAssert.Contains(metadata[0].Value,"data-header-graphic-key=\"Graphic&lt;&amp;&quot;\"");
            Assert.AreSame(hidden,control.ColumnDefinitions[1]); Assert.AreEqual(mode,column.HeaderContentMode?.StaticValue);
        }
    }

    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)]
    public async Task HeaderTypeOverridesGraphicChoiceWithoutDroppingDefinitions(int headerType)
    {
        var control = new HmiDetailedParameterControl { ColumnHeaderType = headerType };
        control.ColumnDefinitions.Add(new HmiParameterColumn { HeaderText = HmiMultilingualText.FromText("Caption"), HeaderContentMode = 3, HeaderGraphic = new HmiImageSource { ImageId = "HeaderImage" } });
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer); layer.Items.Add(control);
        var project = new Project(true); var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen,project);
        StringAssert.Contains(html,"data-parameter-column-header-definition");
        Assert.AreEqual(headerType == 2 ? 1 : 0,project.Calls);
        Assert.AreEqual(headerType != 0,html.Contains("<th scope=\"col\""));
        if (headerType == 1) StringAssert.Contains(html,">1<");
    }
    [TestMethod]
    [DataRow(false,null)] [DataRow(false,0)] [DataRow(false,1)] [DataRow(false,2)] [DataRow(false,3)] [DataRow(false,4)] [DataRow(false,-1)] [DataRow(false,99)]
    [DataRow(true,null)] [DataRow(true,0)] [DataRow(true,1)] [DataRow(true,2)] [DataRow(true,3)] [DataRow(true,4)] [DataRow(true,-1)] [DataRow(true,99)]
    public async Task HeaderGraphicLayoutPreservesSpacingAndStretch(bool overview, int? stretch)
    {
        foreach(var mode in new[]{0,1,2,3}) foreach(var spacing in new uint?[]{null,0,7})
        {
            HmiParameterControlBase control = overview ? new HmiOverviewParameterControl() : new HmiDetailedParameterControl(); control.ColumnHeaderType=2;
            var column=new HmiParameterColumn { HeaderText=HmiMultilingualText.FromText("Caption"), HeaderGraphic=new HmiImageSource { Uri=Uri }, HeaderContentMode=mode };
            if(stretch.HasValue) column.HeaderGraphicStretchMode=stretch.Value;
            if(spacing.HasValue) column.HeaderContentSpacing=spacing.Value;
            control.ColumnDefinitions.Add(column);
            control.ColumnDefinitions.Add(new HmiParameterColumn { Visible=false,HeaderContentSpacing=7u,HeaderGraphicStretchMode=4 });
            var screen=new HmiScreen(); var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(control);
            var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);var heading=Regex.Match(html,"<th scope=\"col\"[\\s\\S]*?</th>").Value;
            Assert.AreEqual(mode==1&&spacing.HasValue,heading.Contains("margin-inline-end:"));
            if(mode==1&&spacing.HasValue) StringAssert.Contains(heading,$"margin-inline-end: {spacing}px;");
            if(mode!=2 && stretch is >=0 and <=3) StringAssert.Contains(heading,"object-fit: "+new[]{"none","fill","contain","cover"}[stretch.Value]+";");
            Assert.AreEqual(mode!=2&&stretch==4,heading.Contains("background-repeat: repeat;"));
            if(mode!=2&&stretch==4) Assert.IsFalse(heading.Contains("<img"));
            Assert.AreEqual(mode is 1 or 2,heading.Contains("Caption"));
            var definitions=Regex.Matches(html,"<div hidden data-parameter-column-header-definition[^>]*>");Assert.AreEqual(2,definitions.Count);
            StringAssert.Contains(definitions[1].Value,"data-header-content-spacing=\"7\"");StringAssert.Contains(definitions[1].Value,"data-header-graphic-stretch-mode=\"4\"");
            Assert.AreEqual(stretch,column.HeaderGraphicStretchMode?.StaticValue);Assert.AreEqual(spacing,column.HeaderContentSpacing?.StaticValue);
        }
    }
}
