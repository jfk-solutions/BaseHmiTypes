using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Buffers.Binary;
using System.Text;
using System.Xml.Linq;
namespace BaseHmiTypes.Tests;

[TestClass] public class MetafileUnicodeTextTests
{
    private static byte[] Emf(string text,uint options=0,int gap=0)
    {
        var fixedSize=(options&0x100)!=0?60:76;var recordSize=(fixedSize+gap+text.Length*2+3)&~3;
        var bytes=new byte[88+recordSize+20];
        void U(int at,uint value)=>BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(at,4),value);
        U(0,1);U(4,88);U(16,99);U(20,49);U(40,0x464D4520);U(44,0x10000);U(48,(uint)bytes.Length);U(52,3);
        U(88,84);U(92,(uint)recordSize);U(96,999);U(100,888); // Ignored bounds deliberately differ.
        U(124,12);U(128,5);U(132,(uint)text.Length);U(136,(uint)(fixedSize+gap));U(140,options);
        Encoding.Unicode.GetBytes(text).CopyTo(bytes,88+fixedSize+gap);U(88+recordSize,14);U(92+recordSize,20);return bytes;
    }
    private static XDocument Render(byte[] bytes)=>XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,".emf")!);
    [TestMethod] [DataRow("0",0)] [DataRow("A&B <test> \"quoted\"",0)] [DataRow("Ä中😀",0)] [DataRow("padded",8)]
    public void UsesEmrTextReferenceCountAndRecordRelativeStringOffset(string text,int gap)
    {
        var bytes=Emf(text,0,gap);var original=bytes.ToArray();var element=Render(bytes).Descendants().Single(e=>e.Name.LocalName=="text");
        Assert.AreEqual(text,element.Value);Assert.AreEqual("12",element.Attribute("x")!.Value);Assert.AreEqual("5",element.Attribute("y")!.Value);CollectionAssert.AreEqual(original,bytes);
    }
    [TestMethod] public void SupportsTheShortNoRectangleLayout()
        =>Assert.AreEqual("A",Render(Emf("A",0x100)).Descendants().Single(e=>e.Name.LocalName=="text").Value);
    [TestMethod] [DataRow("A\0B","A�B")] [DataRow("A\u0001B","A�B")] [DataRow("A\uFFFE B","A� B")] [DataRow("A\0\0","A")]
    public void XmlForbiddenCharactersCannotInvalidateTheImage(string text,string expected)
        =>Assert.AreEqual(expected,Render(Emf(text)).Descendants().Single(e=>e.Name.LocalName=="text").Value);
    [TestMethod] [DataRow("count")] [DataRow("offset")] [DataRow("fixed-fields")] [DataRow("unaligned")] [DataRow("cross-record")] [DataRow("glyphs")] [DataRow("empty")]
    public void MalformedTextAndGlyphIndicesAreNotReadAsUnicode(string invalid)
    {
        var bytes=Emf("X");void U(int at,uint value)=>BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(at,4),value);
        switch(invalid){case "count":U(132,uint.MaxValue);break;case "offset":U(136,uint.MaxValue);break;case "fixed-fields":U(136,20);break;case "unaligned":U(136,77);break;case "cross-record":U(132,10);break;case "glyphs":U(140,0x10);break;case "empty":U(132,0);break;}
        Assert.IsFalse(Render(bytes).Descendants().Any(e=>e.Name.LocalName=="text"));
    }
}
