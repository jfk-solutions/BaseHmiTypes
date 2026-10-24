using System.Globalization;
using System.Numerics;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Recipes;

public sealed class HmiRecipeBinaryField
{
    public string Name { get; set; } = "";
    public int ByteOffset { get; set; }
    public string DataType { get; set; } = "";
    public int? BitIndex { get; set; }
}

/// <summary>Explicit byte offsets and byte order; padding is preserved from the supplied payload.</summary>
public sealed class HmiRecipeBinaryLayout
{
    public int ByteLength { get; set; }
    public bool? LittleEndian { get; set; }
    public IList<HmiRecipeBinaryField> Fields { get; } = new List<HmiRecipeBinaryField>();
}

public static class HmiRecipeBinaryCodec
{
    private static readonly CultureInfo Culture = CultureInfo.InvariantCulture;
    private static (HmiRecipeBinaryField Field, string Type, int Size)[] Fields(HmiRecipeBinaryLayout layout)
    {
        if (layout is null || layout.ByteLength < 1 || layout.ByteLength > 1000000 || layout.LittleEndian is null || layout.Fields.Count < 1 || layout.Fields.Count > 10000)
            throw new FormatException("Invalid explicit recipe binary layout");
        var names = new HashSet<string>(StringComparer.Ordinal);
        var bits = new Dictionary<int, int>();
        return layout.Fields.Select(field => {
            var type = field.DataType?.ToLowerInvariant() ?? "";
            var size = type switch { "bool" or "byte" or "usint" or "sint" => 1, "word" or "uint" or "int" => 2, "dword" or "udint" or "dint" or "real" => 4, "lword" or "ulint" or "lint" or "lreal" => 8, _ => 0 };
            if (string.IsNullOrEmpty(field.Name) || !names.Add(field.Name) || size == 0 || field.ByteOffset < 0 || field.ByteOffset > layout.ByteLength - size || (type == "bool" ? field.BitIndex is null or < 0 or > 7 : field.BitIndex is not null))
                throw new FormatException("Invalid recipe binary field");
            for (var offset = field.ByteOffset; offset < field.ByteOffset + size; offset++) {
                var mask = type == "bool" ? 1 << field.BitIndex!.Value : 255;
                bits.TryGetValue(offset, out var previous);
                if ((previous & mask) != 0) throw new FormatException("Overlapping recipe binary fields");
                bits[offset] = previous | mask;
            }
            return (field, type, size);
        }).ToArray();
    }
    private static void Payload(byte[] bytes, HmiRecipeBinaryLayout layout)
    {
        if (bytes is null || bytes.Length != layout.ByteLength) throw new FormatException("Recipe binary payload size mismatch");
    }
    // Round the exact binary value with the same tie rule in both ports.
    private static string RealText(double value)
    {
        if (value == 0) return BitConverter.DoubleToInt64Bits(value) < 0 ? "-0" : "0e0";
        var bits = unchecked((ulong)BitConverter.DoubleToInt64Bits(value));
        var exponent = (int)((bits >> 52) & 2047);
        var coefficient = new BigInteger((bits & ((1UL << 52) - 1)) | (exponent != 0 ? 1UL << 52 : 0));
        var power = exponent != 0 ? exponent - 1023 - 52 : -1074;
        var scale = 0;
        if (power < 0) { scale = -power; coefficient *= BigInteger.Pow(5, scale); } else coefficient <<= power;
        var digits = coefficient.ToString(Culture); var decimalExponent = digits.Length - scale - 1;
        if (digits.Length > 17) {
            var rounded = BigInteger.Parse(digits.Substring(0, 17), Culture);
            if (digits[17] >= '5') rounded++;
            digits = rounded.ToString(Culture);
            if (digits.Length > 17) { decimalExponent++; digits = digits.Substring(0, 17); }
        }
        digits = digits.TrimEnd('0');
        return (value < 0 ? "-" : "") + digits[0] + (digits.Length > 1 ? "." + digits.Substring(1) : "") + "e" + decimalExponent.ToString(Culture);
    }
    public static byte[] ReadPayload(HmiRecipeBinaryValue value, HmiRecipeBinaryLayout layout)
    {
        Fields(layout);
        var text = value?.PayloadBase64;
        if (text is null || text.Length > 1333336) throw new FormatException("Unavailable or invalid recipe binary payload");
        var bytes = Convert.FromBase64String(text);
        if (Convert.ToBase64String(bytes) != text) throw new FormatException("Noncanonical recipe binary payload");
        if (value!.DecodedByteLength is {} length && length != bytes.Length) throw new FormatException("Recipe binary length metadata mismatch");
        Decode(bytes, layout);
        return bytes;
    }
    public static IReadOnlyDictionary<string, string> Decode(byte[] bytes, HmiRecipeBinaryLayout layout)
    {
        var configured = Fields(layout); Payload(bytes, layout);
        var result = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var (field, type, size) in configured) {
            var offset = field.ByteOffset;
            if (type == "bool") { result[field.Name] = (bytes[offset] & (1 << field.BitIndex!.Value)) != 0 ? "true" : "false"; continue; }
            if (type is "real" or "lreal") {
                var buffer = bytes.Skip(offset).Take(size).ToArray();
                if (BitConverter.IsLittleEndian != layout.LittleEndian!.Value) Array.Reverse(buffer);
                double number = type == "real" ? BitConverter.ToSingle(buffer, 0) : BitConverter.ToDouble(buffer, 0);
                if (double.IsNaN(number) || double.IsInfinity(number)) throw new FormatException("Nonfinite recipe binary field");
                result[field.Name] = RealText(number);
                continue;
            }
            ulong integer = 0;
            for (var i = 0; i < size; i++) integer = (integer << 8) | bytes[offset + (layout.LittleEndian!.Value ? size - 1 - i : i)];
            if (type is "sint" or "int" or "dint" or "lint") {
                var signed = unchecked((long)(integer << (64 - size * 8))) >> (64 - size * 8);
                result[field.Name] = signed.ToString(Culture);
            } else result[field.Name] = integer.ToString(Culture);
        }
        return result;
    }
    public static byte[] Patch(byte[] bytes, IReadOnlyDictionary<string, string> values, HmiRecipeBinaryLayout layout, bool requireAll = true)
    {
        var configured = Fields(layout); Payload(bytes, layout);
        if (values is null || values.Keys.Any(name => !configured.Any(c => c.Field.Name == name)) || requireAll && values.Count != configured.Length)
            throw new FormatException("Recipe binary field schema mismatch");
        var result = (byte[])bytes.Clone();
        foreach (var (field, type, size) in configured) {
            if (!values.TryGetValue(field.Name, out var value)) continue;
            if (value is null) throw new FormatException("Recipe binary field must be scalar text");
            if (type == "bool") {
                if (value.ToLowerInvariant() is not ("true" or "false" or "0" or "1")) throw new FormatException("Invalid binary Boolean");
                var mask = 1 << field.BitIndex!.Value;
                result[field.ByteOffset] = (byte)((result[field.ByteOffset] & ~mask) | (value == "1" || value.Equals("true", StringComparison.OrdinalIgnoreCase) ? mask : 0));
                continue;
            }
            if (type is "real" or "lreal") {
                if (!Regex.IsMatch(value, @"\A[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?\z", RegexOptions.ECMAScript)) throw new FormatException("Invalid binary floating value");
                if (!double.TryParse(value, NumberStyles.Float, Culture, out var number) || double.IsNaN(number) || double.IsInfinity(number) || type == "real" && float.IsInfinity((float)number)) throw new FormatException("Binary floating overflow");
                var buffer = type == "real" ? BitConverter.GetBytes((float)number) : BitConverter.GetBytes(number);
                if (BitConverter.IsLittleEndian != layout.LittleEndian!.Value) Array.Reverse(buffer);
                Array.Copy(buffer, 0, result, field.ByteOffset, size); continue;
            }
            if (!Regex.IsMatch(value, @"\A[+-]?[0-9]+\z")) throw new FormatException("Invalid binary integer");
            ulong integer;
            if (type is "sint" or "int" or "dint" or "lint") {
                if (!long.TryParse(value, NumberStyles.AllowLeadingSign, Culture, out var signed) || size < 8 && (signed < -(1L << (size * 8 - 1)) || signed > (1L << (size * 8 - 1)) - 1)) throw new FormatException("Binary integer overflow");
                integer = unchecked((ulong)signed);
            } else {
                if (!ulong.TryParse(value, NumberStyles.AllowLeadingSign, Culture, out integer) || value.StartsWith("-", StringComparison.Ordinal) && value.TrimStart('-','0').Length != 0 || size < 8 && integer >= (1UL << (size * 8))) throw new FormatException("Binary integer overflow");
            }
            for (var i = 0; i < size; i++) { result[field.ByteOffset + (layout.LittleEndian!.Value ? i : size - 1 - i)] = (byte)integer; integer >>= 8; }
        }
        Decode(result, layout); return result;
    }
}
