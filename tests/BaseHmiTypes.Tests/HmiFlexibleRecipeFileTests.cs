using BaseHmiTypes.Recipes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public sealed class HmiFlexibleRecipeFileTests
{
    private static HmiFlexibleRecipeFileData Fixture(char separator)
    {
        var data = new HmiFlexibleRecipeFileData { RecipeName = "Mix", RecipeNumber = 7, Separator = separator };
        var english = new HmiFlexibleRecipeLanguageRow { LanguageId = 1033 };
        english.RecordNames.Add("First"); english.RecordNames.Add("Second");
        var german = new HmiFlexibleRecipeLanguageRow { LanguageId = 1031 };
        german.RecordNames.Add("Erste"); german.RecordNames.Add("Zweite");
        data.Languages.Add(english); data.Languages.Add(german);
        data.Parameters.Add("Temp"); data.Parameters.Add("Text");
        var first = new HmiFlexibleRecipeFileRecord { Id = 2 };
        first.Values["Temp"] = "12.5"; first.Values["Text"] = "A\"B";
        var second = new HmiFlexibleRecipeFileRecord { Id = 9 };
        second.Values["Temp"] = "-2"; second.Values["Text"] = "Euro €";
        data.Records.Add(first); data.Records.Add(second);
        return data;
    }

    [TestMethod]
    public void NativeRecipeFile_MatchesIndependentEncodedVectors()
    {
        foreach (var (encoding, sep, tokens, headerDigest) in new[] {
            (HmiRecipeFileEncoding.Windows1252, ';', new[] { "h9iuqs", "VDj1CB", "scs3zt", "GbkbaQ", "asQjAM", "qtlkJ0" }, "QSXBVCeuS2ZSDspY3Fkt7A=="),
            (HmiRecipeFileEncoding.Utf16LittleEndian, '\t', new[] { "RcSTFX", "LoZNWh", "Mbc92f", "ea/4A0", "f9kYK9", "7NBz7a" }, "OnanK6VgnLA2+aaaozXFsw==") })
        {
            var rows = new[] { new[] { "Mix", "", "" }, new[] { "LANGID_409", "First", "Second" }, new[] { "LANGID_407", "Erste", "Zweite" }, new[] { "7", "2", "9" }, new[] { "Temp", "12.5", "-2" }, new[] { "Text", "A\"B", "Euro €" } };
            var header = "List separator=" + sep + "Decimal symbol=." + sep + sep + "\"Checksum\"";
            var expected = header + "\r\n" + string.Join("\r\n", rows.Select((row, i) => string.Join(sep.ToString(), row) + sep + tokens[i])) + "\r\n";
            var text = HmiFlexibleRecipeFile.Write(Fixture(sep), encoding);
            Assert.AreEqual(expected, text);
            var parsed = HmiFlexibleRecipeFile.Parse("\uFEFF" + text, encoding);
            var bytes = HmiFlexibleRecipeFile.WriteBytes(Fixture(sep), encoding);
            Assert.AreEqual("Euro €", HmiFlexibleRecipeFile.ParseBytes(bytes, encoding).Records[1].Values["Text"]);
            if (encoding == HmiRecipeFileEncoding.Utf16LittleEndian) CollectionAssert.AreEqual(new byte[] { 255, 254 }, bytes.Take(2).ToArray());
            Assert.AreEqual(7, parsed.RecipeNumber); Assert.AreEqual(2, parsed.Languages.Count);
            Assert.AreEqual("Zweite", parsed.Languages[1].RecordNames[1]);
            Assert.AreEqual("Euro €", parsed.Records[1].Values["Text"]);
            var marker = string.Join(sep.ToString(), new[] { "\"$RT_COUNT$\"", "6", headerDigest, "", "" });
            Assert.IsTrue(HmiFlexibleRecipeFile.VerifyCountMarker(marker, header, 6, encoding, sep));
            Assert.IsFalse(HmiFlexibleRecipeFile.VerifyCountMarker(marker, header, 5, encoding, sep));
            Assert.IsFalse(HmiFlexibleRecipeFile.VerifyCountMarker(marker, header + "x", 6, encoding, sep));
        }
    }

    [TestMethod]
    public void NativeRecipeFile_RejectsTamperingAndUnrepresentableCells()
    {
        var encoding = HmiRecipeFileEncoding.Windows1252;
        var text = HmiFlexibleRecipeFile.Write(Fixture(';'), encoding);
        foreach (var invalid in new[] { text.Replace("12.5", "12.6"), text.Substring(0, text.Length - 2), text.Replace("Temp;12.5", "Temp;12.5;extra"), text.Replace("7;2;9", "7;2;2"), text.Replace("VDj1CB", "VDj1C") })
            Assert.ThrowsExactly<FormatException>(() => HmiFlexibleRecipeFile.Parse(invalid, encoding));
        Assert.AreEqual("12.6", HmiFlexibleRecipeFile.Parse(text.Replace("12.5", "12.6"), encoding, false).Records[0].Values["Temp"]);
        var plain = HmiFlexibleRecipeFile.Write(Fixture(';'), encoding, false);
        Assert.ThrowsExactly<FormatException>(() => HmiFlexibleRecipeFile.Parse(plain, encoding));
        Assert.AreEqual(2, HmiFlexibleRecipeFile.Parse(plain, encoding, false).Records.Count);
        foreach (var invalid in new[] { "a;b", "a\nb", "終", new string('x', 1024) })
        {
            var data = Fixture(';'); data.Records[0].Values["Text"] = invalid;
            Assert.ThrowsExactly<FormatException>(() => HmiFlexibleRecipeFile.Write(data, encoding));
        }
        CollectionAssert.AreEqual(new byte[] { 128, 140, 159, 233 }, HmiFlexibleRecipeFile.EncodeText("€ŒŸé", encoding));
        CollectionAssert.AreEqual(new byte[] { 0x42, 0x7d, 0, 0xd8 }, HmiFlexibleRecipeFile.EncodeText("終\ud800", HmiRecipeFileEncoding.Utf16LittleEndian));
        Assert.IsFalse(HmiFlexibleRecipeFile.VerifyCountMarker("\"$RT_COUNT$\";6;bogus;", "header", 6, encoding));
        Assert.ThrowsExactly<FormatException>(() => HmiFlexibleRecipeFile.ParseBytes(new byte[] { 255, 254 }, encoding));
        Assert.ThrowsExactly<FormatException>(() => HmiFlexibleRecipeFile.ParseBytes(new byte[] { 255, 254, 1 }, HmiRecipeFileEncoding.Utf16LittleEndian));
        Assert.ThrowsExactly<FormatException>(() => HmiFlexibleRecipeFile.ParseBytes(new byte[] { 239, 187, 191 }, encoding));
    }
}
