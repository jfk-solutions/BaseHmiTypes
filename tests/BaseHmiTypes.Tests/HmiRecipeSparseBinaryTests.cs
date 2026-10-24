using BaseHmiTypes.Recipes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public sealed class HmiRecipeSparseBinaryTests
{
    [TestMethod]
    public void BinaryFloatingTextUsesIdenticalTieRounding()
    {
        var layout = new HmiRecipeBinaryLayout { ByteLength = 8, LittleEndian = false };
        layout.Fields.Add(new() { Name = "V", DataType = "LReal", ByteOffset = 0 });
        foreach (var (input, expected) in new[] {
            ("1234567890123456.25", "1.2345678901234563e15"), ("-1234567890123456.25", "-1.2345678901234563e15"),
            ("-0", "-0"), ("0", "0e0"), ("5e-324", "4.9406564584124654e-324"), ("1.7976931348623157e308", "1.7976931348623157e308") }) {
            var bytes = HmiRecipeBinaryCodec.Patch(new byte[8], new Dictionary<string, string> { ["V"] = input }, layout);
            Assert.AreEqual(expected, HmiRecipeBinaryCodec.Decode(bytes, layout)["V"]);
        }
    }
    [TestMethod]
    public void SparsePositionsRequireCompleteBaseline()
    {
        var patch = new HmiRecipeSparseArray { Length = 4 }; patch.Values[1] = "9"; patch.Values[3] = "8";
        var baseline = new[] { "1", "2", "3", "4" };
        CollectionAssert.AreEqual(new[] { "1", "9", "3", "8" }, HmiRecipeSparseArray.Resolve(patch, baseline).ToArray());
        CollectionAssert.AreEqual(new[] { "1", "2", "3", "4" }, baseline);
        patch.Values[4] = "9";
        Assert.ThrowsExactly<FormatException>(() => HmiRecipeSparseArray.Resolve(patch, baseline));
        patch.Values.Remove(4); patch.Values[1] = null;
        Assert.ThrowsExactly<FormatException>(() => HmiRecipeSparseArray.Resolve(patch, baseline));
        patch.Length = null;
        Assert.ThrowsExactly<FormatException>(() => HmiRecipeSparseArray.Resolve(patch, baseline));
    }
    [TestMethod]
    public void ExplicitBinaryFieldsPreservePaddingBitsAndExactIntegers()
    {
        foreach (var littleEndian in new[] { false, true }) {
            var layout = new HmiRecipeBinaryLayout { ByteLength = 20, LittleEndian = littleEndian };
            layout.Fields.Add(new() { Name = "Flag", DataType = "Bool", ByteOffset = 0, BitIndex = 2 });
            layout.Fields.Add(new() { Name = "Count", DataType = "Int", ByteOffset = 2 });
            layout.Fields.Add(new() { Name = "Serial", DataType = "ULInt", ByteOffset = 4 });
            layout.Fields.Add(new() { Name = "Ratio", DataType = "Real", ByteOffset = 12 });
            var original = Enumerable.Repeat((byte)0xaa, 20).ToArray();
            var values = new Dictionary<string, string> { ["Flag"] = "true", ["Count"] = "-32768", ["Serial"] = "18446744073709551615", ["Ratio"] = "1.5" };
            var bytes = HmiRecipeBinaryCodec.Patch(original, values, layout);
            Assert.AreEqual((byte)0xae, bytes[0]); Assert.AreEqual((byte)0xaa, bytes[1]); Assert.AreEqual((byte)0xaa, original[0]);
            CollectionAssert.AreEqual(new byte[] { 170, 170, 170, 170 }, bytes.Skip(16).ToArray());
            var decoded = HmiRecipeBinaryCodec.Decode(bytes, layout);
            Assert.AreEqual("-32768", decoded["Count"]); Assert.AreEqual("18446744073709551615", decoded["Serial"]); Assert.AreEqual("1.5e0", decoded["Ratio"]);
            var snapshot = new HmiRecipeBinaryValue { PayloadBase64 = Convert.ToBase64String(bytes), DecodedByteLength = 20 };
            CollectionAssert.AreEqual(bytes, HmiRecipeBinaryCodec.ReadPayload(snapshot, layout));
            snapshot.DecodedByteLength = 19;
            Assert.ThrowsExactly<FormatException>(() => HmiRecipeBinaryCodec.ReadPayload(snapshot, layout));
            values["Count"] = "32768";
            Assert.ThrowsExactly<FormatException>(() => HmiRecipeBinaryCodec.Patch(bytes, values, layout));
            var partial = HmiRecipeBinaryCodec.Patch(bytes, new Dictionary<string, string> { ["Flag"] = "false" }, layout, false);
            Assert.AreEqual((byte)0xaa, partial[0]); CollectionAssert.AreEqual(bytes.Skip(1).ToArray(), partial.Skip(1).ToArray());
            layout.Fields.Add(new() { Name = "Collision", DataType = "Byte", ByteOffset = 0 });
            Assert.ThrowsExactly<FormatException>(() => HmiRecipeBinaryCodec.Decode(bytes, layout));
        }
    }
}
