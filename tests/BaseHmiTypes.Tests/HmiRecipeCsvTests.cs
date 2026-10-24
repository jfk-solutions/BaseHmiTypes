using System.Text;
using BaseHmiTypes.Recipes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiRecipeCsvTests
{
    [TestMethod]
    public void EngineeringCsv_RoundTripsQuotedUnicodeAndMetadata()
    {
        foreach(var separator in new[]{';',',','\t'}) {
            var record=new HmiRecipeCsvRecord {Id=9007199254740991L,LastUser="Jörg",LastAccess="2026-10-23T12:34:56Z"};
            record.Values["Text"]="a;\"b\"\r\nc\t終";record.Values["Number"]="-12.50";
            var text=HmiRecipeCsv.Write(new[]{record},new[]{"Text","Number"},separator);
            var parsed=HmiRecipeCsv.Parse("\uFEFF"+text,new[]{"Text","Number"},separator).Single();
            Assert.AreEqual(record.Id,parsed.Id);Assert.AreEqual(record.Values["Text"],parsed.Values["Text"]);Assert.AreEqual("-12.50",parsed.Values["Number"]);Assert.AreEqual(record.LastUser,parsed.LastUser);Assert.AreEqual(record.LastAccess,parsed.LastAccess);
        }
    }
    [TestMethod]
    public void EngineeringCsv_RejectsMalformedOrAmbiguousRecords()
    {
        var header="ID;Value;LastUser;LastAccess[UTC]\r\n";
        foreach(var invalid in new[]{"",header+"1;2;;\r\n1;3;;\r\n",header+"0;2;;\r\n",header+"1;\"unfinished",header+"1;\"v\"x;;",header+"1;2;extra;cells;bad",header+"9007199254740992;2;;"})
            Assert.ThrowsExactly<FormatException>(()=>HmiRecipeCsv.Parse(invalid,new[]{"Value"}));
        Assert.ThrowsExactly<FormatException>(()=>HmiRecipeCsv.Parse(header,new[]{"Value","Value"}));
    }
    [TestMethod]
    public void RecipeLineChecksum_ChainsEncodedTokensAndSeparators()
    {
        foreach (var (encoding, first, second) in new[] {
            (Encoding.ASCII, "HQWWxh", "+duZcr"),
            (Encoding.Unicode, "2qPDTC", "GdbwO5") })
        {
            Assert.AreEqual(first, HmiRecipeChecksum.ComputeLine(encoding.GetBytes("\"1\";\"12.5\";"), Array.Empty<byte>()));
            Assert.AreEqual(second, HmiRecipeChecksum.ComputeLine(encoding.GetBytes("\"2\";\"20\";"), encoding.GetBytes(first + "\r\n")));
            Assert.AreNotEqual(second, HmiRecipeChecksum.ComputeLine(encoding.GetBytes("\"2\";\"21\";"), encoding.GetBytes(first + "\r\n")));
        }
        Assert.AreEqual("1B2M2Y8AsgTpgAmY7PhCfg==", HmiRecipeChecksum.ComputeLine(Array.Empty<byte>(), Array.Empty<byte>(), 24));
        foreach (var length in new[] { 0, 25 })
            Assert.ThrowsExactly<ArgumentOutOfRangeException>(() => HmiRecipeChecksum.ComputeLine(Array.Empty<byte>(), Array.Empty<byte>(), length));
    }

    [TestMethod]
    public void RecipeChecksum_MatchesRfc1321Vectors()
    {
        foreach(var (text,expected) in new[]{("","d41d8cd98f00b204e9800998ecf8427e"),("a","0cc175b9c0f1b6a831c399e269772661"),("abc","900150983cd24fb0d6963f7d28e17f72"),("message digest","f96b697d7cb7938d525a2f31aaf161d0"),("abcdefghijklmnopqrstuvwxyz","c3fcd3d76192e4007dfb496cca67e13b")})
            Assert.AreEqual(expected,HmiRecipeChecksum.Compute(Encoding.ASCII.GetBytes(text)));
        Assert.IsTrue(HmiRecipeChecksum.Verify(Encoding.ASCII.GetBytes("abc"),"900150983CD24FB0D6963F7D28E17F72"));
        Assert.IsFalse(HmiRecipeChecksum.Verify(Encoding.ASCII.GetBytes("abcd"),"900150983cd24fb0d6963f7d28e17f72"));
    }
}
