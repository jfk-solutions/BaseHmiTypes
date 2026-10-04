using System.Text;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Images;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;

[TestClass] public class SymbolLibraryAspectRatioTests
{
    [TestMethod]
    [DataRow(true, "none", false)] [DataRow(false, "xMidYMid meet", false)]
    [DataRow(true, "none", true)] [DataRow(false, "xMidYMid meet", true)]
    [DataRow(true, "", true)] [DataRow(false, "", true)]
    public async Task ControlOverridesImageAspectRatioWithoutCorruptingRoot(bool fixedAspect, string intrinsic, bool styled)
    {
        var source=$"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 10\"{(intrinsic.Length==0?"":$" preserveAspectRatio=\"{intrinsic}\"")}{(styled?" style=\"color: red;\"":"")}><path d=\"M0 0L20 10\"/></svg>";
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);
        layer.Items.Add(new HmiSymbolLibraryControl { Name="symbol",SymbolId="synthetic",FixedAspectRatio=fixedAspect,
            Symbol=new HmiImage {ImageType=HmiImageType.Svg,Data=Encoding.UTF8.GetBytes(source)} });
        var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html,$"preserveAspectRatio=\"{(fixedAspect?"xMidYMid meet":"none")}\"");
        StringAssert.Contains(html,"data-hmi-symbol-id=\"synthetic\"");
        StringAssert.Contains(html,"width: 100%; height: 100%; display: block;");
        StringAssert.Contains(html,"<path d=\"M0 0L20 10\"/>");
        if(styled)StringAssert.Contains(html,"color: red;");
        var root=System.Text.RegularExpressions.Regex.Match(html,"<svg[^>]*data-hmi-symbol-id=\"synthetic\"[^>]*>").Value;
        Assert.AreEqual(1,root.Split("preserveAspectRatio=").Length-1);
    }
}
