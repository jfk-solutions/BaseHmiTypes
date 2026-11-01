using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.UnifiedXml;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Xml.Linq;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiUnifiedXmlFormattedTextTests
{
    [TestMethod]
    public void FormattedFragmentsRoundTripWithoutRedundantWrappersOrNamespaceDeclarations()
    {
        var cases = new[] {
            "<body><p/></body>",
            "<body><p>  A <b>bold</b>\n<i>italic</i>&amp; &lt; &gt; \t\r\n</p></body>",
            "<body><p style=\"margin: 0;\"> \t\r\n</p></body>",
            "<body><p>first</p><p>second</p></body>",
            "<body style=\"color: red;\"><p>text</p></body>",
            "<body> <span title=\"a&#xA;b\">text</span>\t</body>",
            "<body/>",
            "<body><p><div>inside</div></p></body>",
            "<body><p><mark><ruby>字<rt>ji</rt></ruby></mark><button>caption</button></p></body>",
            "<body xml:space=\"preserve\"><p> \t\r\n</p></body>",
            "<body><p><span title=\"a&#x9;b&#xA;c&#xD;d\"> x </span></p></body>"
        };
        XNamespace n=HmiScreenToUnifiedXmlConverter.Namespace;
        foreach (var formatted in cases)
        {
            var text=new HmiMultilingualText(); text.Texts[1031]=formatted; text.FormattedTexts[1031]=formatted; text.Texts[1033]="";
            var screen=new HmiScreen {Name="Main",DisplayName=text};
            var xml=new HmiScreenToUnifiedXmlConverter().Convert(screen,"Panel").Xml;
            var root=XElement.Parse(xml,LoadOptions.PreserveWhitespace);
            var item=root.Descendants(n+"multilingual-text-item").Single(e=>(string?)e.Attribute("lang")=="de-DE");
            Assert.IsFalse(item.Descendants(n+"body").Any());
            Assert.IsFalse(item.DescendantsAndSelf().Attributes().Any(a=>a.IsNamespaceDeclaration));
            Assert.IsNull(item.Attribute("text"));
            if(formatted==cases[0]) {Assert.IsFalse(item.HasElements);Assert.IsFalse(item.Nodes().Any());}
            if(formatted==cases[1]) Assert.IsFalse(item.Elements(n+"p").Any());
            if(formatted==cases[2]) Assert.AreEqual("margin: 0;",(string?)item.Element(n+"p")!.Attribute("style"));
            if(formatted==cases[3]) Assert.AreEqual(2,item.Elements(n+"p").Count());
            var restored=new HmiUnifiedXmlToScreenConverter().Convert(xml).Screen;
            Assert.AreEqual(formatted,restored.DisplayName!.FormattedTexts[1031],formatted);
            Assert.AreEqual("",restored.DisplayName.Texts[1033]);Assert.IsFalse(restored.DisplayName.FormattedTexts.ContainsKey(1033));
            Assert.AreEqual(2,restored.DisplayName.Texts.Count);
            Assert.AreEqual(0,restored.Layers.Single().Items.Count); // HTML button is not an engineering control.
            var second=new HmiScreenToUnifiedXmlConverter().Convert(restored,"Panel").Xml;
            Assert.AreEqual(xml,second);
        }
    }

    [TestMethod]
    public void ConflictingPlainTextAndHtmlAreRejected()
    {
        var source=$"""<unified-export xmlns="{HmiScreenToUnifiedXmlConverter.Namespace}" version="2" scope="screen" screen="Main" complete="true"><screen name="Main"><display-name><multilingual-text-item lang="de-DE" text="plain"><b>formatted</b></multilingual-text-item></display-name></screen></unified-export>""";
        Assert.ThrowsExactly<FormatException>(()=>new HmiUnifiedXmlToScreenConverter().Convert(source));
    }
}
