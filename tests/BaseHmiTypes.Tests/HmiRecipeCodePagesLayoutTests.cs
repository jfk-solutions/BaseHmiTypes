using BaseHmiTypes.Recipes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public sealed class HmiRecipeCodePagesLayoutTests
{
    [TestMethod]
    public void CodePages_PreserveExactBytesAndFileChecksums()
    {
        foreach (var (encoding, text, bytes) in new[] {
            (HmiRecipeFileEncoding.Windows1250, "Łódź", new byte[] { 0xa3, 0xf3, 0x64, 0x9f }),
            (HmiRecipeFileEncoding.Windows1251, "Привет", new byte[] { 0xcf, 0xf0, 0xe8, 0xe2, 0xe5, 0xf2 }),
            (HmiRecipeFileEncoding.Windows1253, "Ελλάδα", new byte[] { 0xc5, 0xeb, 0xeb, 0xdc, 0xe4, 0xe1 }),
            (HmiRecipeFileEncoding.Windows1254, "İğış", new byte[] { 0xdd, 0xf0, 0xfd, 0xfe }),
            (HmiRecipeFileEncoding.Windows1255, "שלום", new byte[] { 0xf9, 0xec, 0xe5, 0xed }),
            (HmiRecipeFileEncoding.Windows1256, "مرحبا", new byte[] { 0xe3, 0xd1, 0xcd, 0xc8, 0xc7 }),
            (HmiRecipeFileEncoding.Windows1257, "Āžu", new byte[] { 0xc2, 0xfe, 0x75 }),
            (HmiRecipeFileEncoding.Windows1258, "đa\u0301", new byte[] { 0xf0, 0x61, 0xec }),
            (HmiRecipeFileEncoding.Windows874, "ไทย", new byte[] { 0xe4, 0xb7, 0xc2 }),
            (HmiRecipeFileEncoding.Windows932, "日本", new byte[] { 0x93, 0xfa, 0x96, 0x7b }),
            (HmiRecipeFileEncoding.Windows936, "中文", new byte[] { 0xd6, 0xd0, 0xce, 0xc4 }),
            (HmiRecipeFileEncoding.Windows949, "한국", new byte[] { 0xc7, 0xd1, 0xb1, 0xb9 }),
            (HmiRecipeFileEncoding.Windows950, "中文", new byte[] { 0xa4, 0xa4, 0xa4, 0xe5 }) })
        {
            CollectionAssert.AreEqual(bytes, HmiFlexibleRecipeFile.EncodeText(text, encoding));
            Assert.AreEqual(text, HmiFlexibleRecipeFile.DecodeText(bytes, encoding));
            var document = new HmiFlexibleRecipeFileData { RecipeName = "Mix", RecipeNumber = 1 };
            var language = new HmiFlexibleRecipeLanguageRow { LanguageId = 1033 }; language.RecordNames.Add("Record");
            document.Languages.Add(language); document.Parameters.Add("Text");
            var record = new HmiFlexibleRecipeFileRecord { Id = 1 }; record.Values["Text"] = text; document.Records.Add(record);
            var decoded = HmiFlexibleRecipeFile.ParseBytes(HmiFlexibleRecipeFile.WriteBytes(document, encoding), encoding);
            Assert.AreEqual(text, decoded.Records[0].Values["Text"]);
        }
        Assert.ThrowsExactly<FormatException>(() => HmiFlexibleRecipeFile.EncodeText("😀", HmiRecipeFileEncoding.Windows936));
        Assert.ThrowsExactly<FormatException>(() => HmiFlexibleRecipeFile.ParseBytes(new byte[] { 0x81 }, HmiRecipeFileEncoding.Windows932));
    }
    private static HmiRecipeFilePathSegment Member(string name) => new() { Member = name };
    private static HmiRecipeFilePathSegment Index(int index) => new() { Index = index };
    private static HmiRecipeFileField Field(string name, params HmiRecipeFilePathSegment[] path)
    {
        var result = new HmiRecipeFileField { Name = name }; foreach (var segment in path) result.Path.Add(segment); return result;
    }
    private static HmiRecipeFileField[] Fields() => new[] {
        Field("Configuration.Speed", Member("Configuration"), Member("Speed")),
        Field("Temperatures[4]", Member("Temperatures"), Index(0)),
        Field("Temperatures[5]", Member("Temperatures"), Index(1)),
        Field("Parts[1].Name", Member("Parts"), Index(0), Member("Name")) };
    private static Dictionary<string, string> Leaves() => new() {
        ["Configuration.Speed"] = "-9007199254740993", ["Temperatures[4]"] = "1.25", ["Temperatures[5]"] = "2.5", ["Parts[1].Name"] = "日本" };

    [TestMethod]
    public void StructuresAndArrays_RoundTripExplicitLeafRows()
    {
        var fields = Fields(); var leaves = Leaves();
        var value = HmiRecipeFileLayout.Expand(leaves, fields);
        Assert.AreEqual(HmiRecipeValueKind.Map, value.Kind);
        Assert.AreEqual(2, value.Entries.Single(entry => entry.Key == "Temperatures").Value.Items.Count);
        var document = new HmiFlexibleRecipeFileData { RecipeName = "Parts", RecipeNumber = 3, Separator = '\t' };
        var language = new HmiFlexibleRecipeLanguageRow { LanguageId = 1041 }; language.RecordNames.Add("Record"); document.Languages.Add(language);
        foreach (var field in fields) document.Parameters.Add(field.Name);
        var record = new HmiFlexibleRecipeFileRecord { Id = 5 };
        foreach (var leaf in HmiRecipeFileLayout.Flatten(value, fields)) record.Values[leaf.Key] = leaf.Value;
        document.Records.Add(record);
        var decoded = HmiFlexibleRecipeFile.ParseBytes(HmiFlexibleRecipeFile.WriteBytes(document, HmiRecipeFileEncoding.Utf16LittleEndian), HmiRecipeFileEncoding.Utf16LittleEndian);
        var expanded = HmiRecipeFileLayout.Expand(decoded.Records[0].Values, fields);
        foreach (var leaf in HmiRecipeFileLayout.Flatten(expanded, fields)) Assert.AreEqual(leaves[leaf.Key], leaf.Value);
    }
    [TestMethod]
    public void Layout_RejectsSparseOverlappingAndUnmappedValues()
    {
        foreach (var fields in new[] {
            new[] { Field("A", Member("A")), Field("B", Member("A"), Index(0)) },
            new[] { Field("A", Member("A"), Index(1)) },
            new[] { Field("A", new HmiRecipeFilePathSegment { Member = "A", Index = 0 }) },
            new[] { Field("A", Member("A")), Field("A", Member("B")) } })
            Assert.ThrowsExactly<FormatException>(() => HmiRecipeFileLayout.Expand(new Dictionary<string, string> { ["A"] = "1", ["B"] = "2" }, fields));
        var leaves = Leaves(); leaves["Extra"] = "x";
        Assert.ThrowsExactly<FormatException>(() => HmiRecipeFileLayout.Expand(leaves, Fields()));
        var tree = HmiRecipeFileLayout.Expand(Leaves(), Fields()); tree.Entries.Add(tree.Entries[0]);
        Assert.ThrowsExactly<FormatException>(() => HmiRecipeFileLayout.Flatten(tree, Fields()));
        var record = new HmiRecipeCsvRecord { Id = 1 }; record.ArrayValues["A"] = new List<string> { "1", "2" };
        Assert.ThrowsExactly<FormatException>(() => HmiRecipeCsv.Write(new[] { record }, new[] { "A" }));
    }
}
