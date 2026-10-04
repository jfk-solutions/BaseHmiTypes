using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;
[TestClass] public class GraphicImageLayoutHtmlTests
{
    private const string Svg="<svg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20' title='x > y'><rect width='40' height='20' fill='red'/></svg>";
    private static ValueTask<string> Render(HmiGraphicView item)
    {item.Name??="Graphic";var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);return new HmiScreenToHtmlConverter().ConvertAsync(screen);}
    private static string Decoded(string html)
    {var value=Regex.Match(html,"src=\"data:image/svg\\+xml;base64,([^\"]+)\"").Groups[1].Value;Assert.IsFalse(string.IsNullOrEmpty(value));return Encoding.UTF8.GetString(Convert.FromBase64String(value));}
    [TestMethod] [DataRow(false,0)] [DataRow(false,1)] [DataRow(false,2)] [DataRow(false,3)] [DataRow(true,0)] [DataRow(true,1)] [DataRow(true,2)] [DataRow(true,3)]
    public async Task EmbeddedSvgViewportPolicySupportsBomAndEncodingWithoutChangingSource(bool keep,int encoding)
    {
        Encoding e=encoding<2?new UTF8Encoding(encoding==1):encoding==2?Encoding.Unicode:Encoding.BigEndianUnicode;
        var declaration=$"<?xml version='1.0' encoding='{(encoding<2?"UTF-8":encoding==2?"UTF-16":"UTF-16BE")}'?>";
        byte[] bytes=[..e.GetPreamble(),..e.GetBytes(declaration+"\n<!--root--><?test data?>"+Svg)];var uri="data:image/svg+xml;base64,"+Convert.ToBase64String(bytes);
        var source=new HmiImageSource {Uri=uri};var item=new HmiGraphicView {Name="Svg",Image=source,ImageKeepAspectRatio=keep,Width=100,Height=100};
        var html=await Render(item);StringAssert.Contains(html,$"object-fit: {(keep?"contain":"fill")}; object-position: 50% 50%;");
        var svg=Decoded(html);StringAssert.Contains(svg,$"preserveAspectRatio=\"{(keep?"xMidYMid meet":"none")}\"");StringAssert.Contains(svg,"title='x > y'");StringAssert.Contains(svg,"<!--root--><?test data?>");Assert.IsFalse(svg.Contains("<?xml",StringComparison.Ordinal));Assert.AreEqual(uri,source.Uri);
    }
    [TestMethod] [DataRow("'")] [DataRow("\"")]
    public async Task ExistingRootPolicyIsReplacedWithoutTouchingNestedOrLookalikeAttributes(string quote)
    {
        var svg=$"<svg xmlns='http://www.w3.org/2000/svg' data-note='preserveAspectRatio=fake' preserveAspectRatio={quote}xMaxYMin slice{quote}><svg preserveAspectRatio='xMinYMin meet'/></svg>";
        var html=await Render(new() {Source="data:image/svg+xml;base64,"+Convert.ToBase64String(Encoding.UTF8.GetBytes(svg)),ImageKeepAspectRatio=false});
        var actual=Decoded(html);StringAssert.Contains(actual,$"preserveAspectRatio={quote}none{quote}");StringAssert.Contains(actual,"data-note='preserveAspectRatio=fake'");StringAssert.Contains(actual,"<svg preserveAspectRatio='xMinYMin meet'/>");
    }
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task PercentEncodedSvgUsesTheSamePolicy(bool keep)
    {var html=await Render(new() {Source="data:image/svg+xml;charset=utf-8,"+Uri.EscapeDataString(Svg),ImageKeepAspectRatio=keep});StringAssert.Contains(Decoded(html),keep?"xMidYMid meet":"none");}
    [TestMethod] [DataRow("data:image/svg+xml;base64,!!!")] [DataRow("data:image/svg+xml;base64")]
    [DataRow("<html><svg/></html>")] [DataRow("<!DOCTYPE html><svg/>")]
    [DataRow("<!DOCTYPE svg [<!ENTITY x 'text'>]><svg/>")]
    [DataRow("<!DOCTYPEsvg><svg/>")]
    [DataRow("<!DOCTYPE svg SYSTEM 'unfinished><svg/>")]
    [DataRow("<!DOCTYPE svg PUBLIC 'missing-system'><svg/>")]
    [DataRow("<!DOCTYPE svg><!DOCTYPE svg><svg/>")]
    [DataRow("<!DOCTYPE svg SYSTEM unquoted><svg/>")]
    [DataRow("<!DOCTYPE svg SYSTEM 'x'<svg/>")]
    [DataRow("<svg preserveAspectRatio='none' preserveAspectRatio='none'/>")]
    public async Task UnsupportedEmbeddedSvgLayoutsStayPlaceholders(string source)
    {var uri=source.StartsWith("data:",StringComparison.Ordinal)?source:"data:image/svg+xml;base64,"+Convert.ToBase64String(Encoding.UTF8.GetBytes(source));StringAssert.Contains(await Render(new() {Source=uri,ImageKeepAspectRatio=false}),"Graphic image");}
    public static IEnumerable<object[]> Doctypes()
    {
        foreach(var header in new[] {"<!DOCTYPE svg>","<!--before--><!DOCTYPE svg SYSTEM 'https://example.invalid/a>b'><!----><?after ok?>","<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" 'https://example.invalid/svg.dtd'>"})
        foreach(var keep in new[] {false,true})
        foreach(var encoding in new[] {0,1,2,3}) yield return [header,keep,encoding];
    }
    [TestMethod, DynamicData(nameof(Doctypes))]
    public async Task SvgDoctypeIsPreservedWithoutResolvingDtd(string header,bool keep,int encoding)
    {
        Encoding e=encoding<2?new UTF8Encoding(encoding==1):encoding==2?Encoding.Unicode:Encoding.BigEndianUnicode;
        byte[] bytes=[..e.GetPreamble(),..e.GetBytes(header+Svg)];var uri="data:image/svg+xml;base64,"+Convert.ToBase64String(bytes);
        var source=new HmiImageSource {Uri=uri};var html=await Render(new() {Image=source,ImageKeepAspectRatio=keep});
        var actual=Decoded(html);StringAssert.StartsWith(actual,header);StringAssert.Contains(actual,$"preserveAspectRatio=\"{(keep?"xMidYMid meet":"none")}\"");Assert.AreEqual(uri,source.Uri);
    }
    [TestMethod]
    [DataRow(0,0)] [DataRow(0,1)] [DataRow(0,2)] [DataRow(0,3)] [DataRow(1,0)] [DataRow(1,1)] [DataRow(1,2)] [DataRow(1,3)]
    [DataRow(2,0)] [DataRow(2,1)] [DataRow(2,2)] [DataRow(2,3)] [DataRow(3,0)] [DataRow(3,1)] [DataRow(3,2)] [DataRow(3,3)]
    public async Task ExistingImageAlignmentControlsObjectPosition(int horizontal,int vertical)
    {var html=await Render(new() {Source="picture.png",ImageScaled=true,ImageKeepAspectRatio=true,ImageHorizontalAlignment=(HmiHorizontalAlignment)horizontal,ImageVerticalAlignment=(HmiVerticalAlignment)vertical});StringAssert.Contains(html,$"object-fit: contain; object-position: {(horizontal==0?0:horizontal==2?100:50)}% {(vertical==0?0:vertical==2?100:50)}%;");}
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task UnscaledImagesUseIntrinsicSizeRegardlessOfAspectPolicy(bool keep)
    {StringAssert.Contains(await Render(new() {Source="picture.png",ImageScaled=false,ImageKeepAspectRatio=keep}),"object-fit: none; object-position: 50% 50%;");}
    [TestMethod] public async Task MissingLayoutPropertiesRetainLegacyMarkup()
    {var html=Regex.Match(await Render(new() {Source="picture.png"}),"<img id=\"Graphic\"[^>]*>").Value;Assert.IsFalse(html.Contains("object-fit:",StringComparison.Ordinal));StringAssert.Contains(html,"src=\"picture.png\"");}
    [TestMethod] public async Task GeneratedOverflowViewportTakesPrecedenceOverImageLayout()
    {var html=Regex.Match(await Render(new() {Source="picture.png",Width=40,Height=20,ImageKeepAspectRatio=true,ImageOverflowPadding=new() {Left=2,Top=3,Right=4,Bottom=5}}),"<div id=\"Graphic\"[^>]*><img[^>]*></div>").Value;StringAssert.Contains(html,"width: 46px; height: 28px;");Assert.IsFalse(html.Contains("object-fit:",StringComparison.Ordinal));}
}
