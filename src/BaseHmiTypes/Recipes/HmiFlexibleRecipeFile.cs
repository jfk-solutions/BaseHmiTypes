using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace BaseHmiTypes.Recipes;

public enum HmiRecipeFileEncoding
{
    Windows1252 = 0, Utf16LittleEndian = 1,
    Windows874 = 874, Windows932 = 932, Windows936 = 936, Windows949 = 949, Windows950 = 950,
    Windows1250 = 1250, Windows1251 = 1251, Windows1253 = 1253, Windows1254 = 1254,
    Windows1255 = 1255, Windows1256 = 1256, Windows1257 = 1257, Windows1258 = 1258,
}

public sealed class HmiFlexibleRecipeLanguageRow
{
    public int LanguageId { get; set; }
    public IList<string> RecordNames { get; } = new List<string>();
}

public sealed class HmiFlexibleRecipeFileRecord
{
    public int Id { get; set; }
    public IDictionary<string, string> Values { get; } = new Dictionary<string, string>(StringComparer.Ordinal);
}

public sealed class HmiFlexibleRecipeFileData
{
    public string RecipeName { get; set; } = "";
    public int RecipeNumber { get; set; }
    public char Separator { get; set; } = ';';
    public char DecimalSeparator { get; set; } = '.';
    public IList<HmiFlexibleRecipeLanguageRow> Languages { get; } = new List<HmiFlexibleRecipeLanguageRow>();
    public IList<string> Parameters { get; } = new List<string>();
    public IList<HmiFlexibleRecipeFileRecord> Records { get; } = new List<HmiFlexibleRecipeFileRecord>();
}

/// <summary>Transposed scalar recipe files. Cells are literal separator-delimited text, not quoted CSV.</summary>
public static class HmiFlexibleRecipeFile
{
    private const int Limit = 16 * 1024 * 1024;

    /// <summary>Strict checksum encoding. The storage adapter must use the same encoding.</summary>
    public static byte[] EncodeText(string text, HmiRecipeFileEncoding encoding)
    {
        return HmiRecipeTextEncoding.Encode(text, encoding);
    }

    /// <summary>Decodes an exact text payload; file BOM handling belongs to ParseBytes.</summary>
    public static string DecodeText(byte[] bytes, HmiRecipeFileEncoding encoding) => HmiRecipeTextEncoding.Decode(bytes, encoding);

    /// <summary>UTF-16LE files carry FF FE; unmarked input requires an explicit encoding.</summary>
    public static HmiFlexibleRecipeFileData ParseBytes(byte[] bytes, HmiRecipeFileEncoding encoding, bool verifyChecksums = true)
    {
        if (bytes is null || bytes.Length > 2 * Limit + 2)
            throw new FormatException("Invalid recipe bytes or encoding");
        var bom = bytes.Length >= 2 && bytes[0] == 255 && bytes[1] == 254;
        if (bytes.Length >= 2 && bytes[0] == 254 && bytes[1] == 255 || bytes.Length >= 3 && bytes[0] == 239 && bytes[1] == 187 && bytes[2] == 191 || bom && encoding != HmiRecipeFileEncoding.Utf16LittleEndian)
            throw new FormatException("Recipe BOM and encoding mismatch");
        var start = bom ? 2 : 0;
        if (encoding == HmiRecipeFileEncoding.Utf16LittleEndian && (bytes.Length - start) % 2 != 0)
            throw new FormatException("Invalid recipe byte length");
        var payload = new byte[bytes.Length - start];
        Buffer.BlockCopy(bytes, start, payload, 0, payload.Length);
        return Parse(HmiRecipeTextEncoding.Decode(payload, encoding), encoding, verifyChecksums);
    }

    public static byte[] WriteBytes(HmiFlexibleRecipeFileData data, HmiRecipeFileEncoding encoding, bool checksums = true)
    {
        var bytes = EncodeText(Write(data, encoding, checksums), encoding);
        if (encoding != HmiRecipeFileEncoding.Utf16LittleEndian) return bytes;
        var output = new byte[bytes.Length + 2];
        output[0] = 255; output[1] = 254;
        Buffer.BlockCopy(bytes, 0, output, 2, bytes.Length);
        return output;
    }

    public static HmiFlexibleRecipeFileData Parse(string text, HmiRecipeFileEncoding encoding, bool verifyChecksums = true)
    {
        if (text is null || text.Length > Limit) throw new FormatException("Recipe file exceeds the text limit");
        if (text.StartsWith("\uFEFF", StringComparison.Ordinal)) text = text.Substring(1);
        EncodeText(text, encoding);
        if (text.IndexOf('\0') >= 0 || Regex.IsMatch(text, "\r(?!\n)") || !text.EndsWith("\n", StringComparison.Ordinal))
            throw new FormatException("Invalid or truncated recipe lines");
        var lines = text.Substring(0, text.Length - 1).Split('\n').Select(line => line.EndsWith("\r", StringComparison.Ordinal) ? line.Substring(0, line.Length - 1) : line).ToArray();
        if (lines.Length < 5 || lines.Length > 10260) throw new FormatException("Invalid recipe row count");
        var header = lines[0];
        if (!header.StartsWith("List separator=", StringComparison.Ordinal) || header.Length < 16) throw new FormatException("Invalid recipe header");
        var sep = header[15];
        ValidateSeparator(sep);
        var headerCells = header.Split(sep).ToList();
        var checkedFile = headerCells[headerCells.Count - 1] == "\"Checksum\"";
        if (checkedFile) headerCells.RemoveAt(headerCells.Count - 1);
        if (verifyChecksums && !checkedFile) throw new FormatException("Recipe checksums are missing");
        if (headerCells.Count < 2 || headerCells[0] != "List separator=" || !Regex.IsMatch(headerCells[1], "^Decimal symbol=[.,]$") || headerCells.Skip(2).Any(c => c != ""))
            throw new FormatException("Invalid recipe header columns");
        var decimalSeparator = headerCells[1][headerCells[1].Length - 1];
        if (sep == decimalSeparator) throw new FormatException("Recipe separators must differ");
        var width = headerCells.Count;
        if (width > 65536 || (long)width * lines.Length > 1000000) throw new FormatException("Invalid recipe column count or cell budget");
        var previous = "";
        var rows = new Queue<string[]>();
        foreach (var line in lines.Skip(1))
        {
            var body = line;
            if (checkedFile)
            {
                var at = line.LastIndexOf(sep);
                var token = line.Substring(at + 1);
                if (at < 0 || !Regex.IsMatch(token, "^[A-Za-z0-9+/=]{1,24}$")) throw new FormatException("Invalid recipe checksum field");
                if (previous.Length > 0 && token.Length != previous.Length) throw new FormatException("Inconsistent recipe checksum width");
                body = line.Substring(0, at);
                if (verifyChecksums && HmiRecipeChecksum.ComputeLine(EncodeText(line.Substring(0, at + 1), encoding), EncodeText(previous.Length > 0 ? previous + "\r\n" : "", encoding), token.Length) != token)
                    throw new FormatException("Recipe checksum mismatch");
                previous = token;
            }
            var cells = body.Split(sep);
            if (cells.Length != width) throw new FormatException("Recipe record column count mismatch");
            foreach (var value in cells) Cell(value, sep);
            rows.Enqueue(cells);
        }
        var title = rows.Dequeue();
        if (title[0].Length == 0 || title.Skip(1).Any(c => c != "")) throw new FormatException("Invalid recipe name row");
        var result = new HmiFlexibleRecipeFileData { RecipeName = title[0], Separator = sep, DecimalSeparator = decimalSeparator };
        while (rows.Count > 0 && rows.Peek()[0].StartsWith("LANGID_", StringComparison.Ordinal))
        {
            var row = rows.Dequeue();
            var match = Regex.Match(row[0], "^LANGID_([0-9a-f]{1,4})$", RegexOptions.IgnoreCase);
            if (!match.Success || result.Languages.Count >= 256) throw new FormatException("Invalid recipe language");
            var languageId = int.Parse(match.Groups[1].Value, NumberStyles.HexNumber, CultureInfo.InvariantCulture);
            var names = row.Skip(1).ToArray();
            if (result.Languages.Any(l => l.LanguageId == languageId) || names.Any(n => n.Length == 0) || names.Distinct(StringComparer.Ordinal).Count() != names.Length)
                throw new FormatException("Duplicate or empty recipe record names");
            var language = new HmiFlexibleRecipeLanguageRow { LanguageId = languageId };
            foreach (var name in names) language.RecordNames.Add(name);
            result.Languages.Add(language);
        }
        if (result.Languages.Count == 0 || rows.Count == 0) throw new FormatException("Missing recipe language or identity row");
        var identity = rows.Dequeue();
        result.RecipeNumber = Number(identity[0]);
        foreach (var id in identity.Skip(1).Select(Number)) result.Records.Add(new HmiFlexibleRecipeFileRecord { Id = id });
        if (result.Records.Select(r => r.Id).Distinct().Count() != result.Records.Count) throw new FormatException("Duplicate recipe record numbers");
        foreach (var row in rows)
        {
            var name = row[0];
            if (name.Length == 0 || name.StartsWith("LANGID_", StringComparison.Ordinal) || name == "\"$RT_COUNT$\"" || result.Parameters.Contains(name))
                throw new FormatException("Duplicate or reserved recipe parameter");
            result.Parameters.Add(name);
            for (var i = 0; i < result.Records.Count; i++) result.Records[i].Values[name] = row[i + 1];
        }
        if (result.Parameters.Count == 0 || result.Parameters.Count > 10000) throw new FormatException("Invalid recipe parameter count");
        return result;
    }

    public static string Write(HmiFlexibleRecipeFileData data, HmiRecipeFileEncoding encoding, bool checksums = true)
    {
        ValidateSeparator(data.Separator);
        if (data.DecimalSeparator != '.' && data.DecimalSeparator != ',' || data.Separator == data.DecimalSeparator ||
            data.Records.Count == 0 || data.Records.Count > 65535 || data.Languages.Count == 0 || data.Languages.Count > 256 || data.Parameters.Count == 0 || data.Parameters.Count > 10000 ||
            (long)(data.Records.Count + 1) * (data.Parameters.Count + data.Languages.Count + 3) > 1000000)
            throw new FormatException("Invalid native recipe dimensions or separators");
        var sep = data.Separator;
        if (data.Parameters.Distinct(StringComparer.Ordinal).Count() != data.Parameters.Count || data.Records.Any(record => record.Values.Count != data.Parameters.Count || record.Values.Keys.Any(key => !data.Parameters.Contains(key))))
            throw new FormatException("Native recipe parameter schema mismatch");
        long budget = 0;
        string Join(IEnumerable<string> cells)
        {
            var values = cells.Select(value => Cell(value, sep)).ToArray();
            budget += values.Sum(value => (long)value.Length) + values.Length + 32;
            if (budget > Limit) throw new FormatException("Recipe file exceeds the text limit");
            return string.Join(sep.ToString(), values);
        }
        var rows = new List<string> { Join(new[] { data.RecipeName }.Concat(data.Records.Select(_ => ""))) };
        foreach (var language in data.Languages)
        {
            if (language.LanguageId < 0 || language.LanguageId > 65535 || language.RecordNames.Count != data.Records.Count)
                throw new FormatException("Invalid recipe language row");
            rows.Add(Join(new[] { "LANGID_" + language.LanguageId.ToString("x", CultureInfo.InvariantCulture) }.Concat(language.RecordNames)));
        }
        rows.Add(Join(new[] { data.RecipeNumber.ToString(CultureInfo.InvariantCulture) }.Concat(data.Records.Select(r => r.Id.ToString(CultureInfo.InvariantCulture)))));
        foreach (var parameter in data.Parameters) rows.Add(Join(new[] { parameter }.Concat(data.Records.Select(record => record.Values[parameter]))));
        var header = "List separator=" + sep + "Decimal symbol=" + data.DecimalSeparator + new string(sep, data.Records.Count - 1);
        if (checksums) header += sep + "\"Checksum\"";
        var previous = "";
        var output = new StringBuilder(header).Append("\r\n");
        foreach (var row in rows)
        {
            var body = row + (checksums ? sep.ToString() : "");
            var token = checksums ? HmiRecipeChecksum.ComputeLine(EncodeText(body, encoding), EncodeText(previous.Length > 0 ? previous + "\r\n" : "", encoding)) : "";
            if ((long)output.Length + body.Length + token.Length + 2 > Limit) throw new FormatException("Recipe file exceeds the text limit");
            output.Append(body).Append(token).Append("\r\n");
            previous = token;
        }
        var result = output.ToString();
        EncodeText(result, encoding);
        Parse(result, encoding, checksums);
        return result;
    }

    /// <summary>
    /// Validates a decoded count-marker row against its header and an explicit expected count.
    /// Recipe exports do not require this marker. Verify its chained row checksum separately.
    /// </summary>
    public static bool VerifyCountMarker(string row, string header, long expectedCount, HmiRecipeFileEncoding encoding, char separator = ';')
    {
        ValidateSeparator(separator);
        if (row is null || header is null || row.Length > Limit || header.Length > Limit || expectedCount < 0 || expectedCount > 9007199254740991L || row.IndexOfAny(new[] { '\r', '\n', '\0' }) >= 0 || header.IndexOfAny(new[] { '\r', '\n', '\0' }) >= 0) return false;
        var cells = row.Split(separator);
        if (cells.Length < 4 || cells[0] != "\"$RT_COUNT$\"" || !Regex.IsMatch(cells[1], "^(0|[1-9][0-9]*)$") ||
            !long.TryParse(cells[1], NumberStyles.None, CultureInfo.InvariantCulture, out var count) || count != expectedCount || cells.Skip(3).Any(c => c != "")) return false;
        var token = cells[2];
        return Regex.IsMatch(token, "^[A-Za-z0-9+/=]{1,24}$") && HmiRecipeChecksum.ComputeLine(EncodeText(header, encoding), Array.Empty<byte>(), token.Length) == token;
    }

    private static void ValidateSeparator(char value)
    {
        if (value != ';' && value != ',' && value != '\t') throw new FormatException("Invalid recipe separator");
    }
    private static int Number(string value)
    {
        if (!Regex.IsMatch(value, "^[1-9][0-9]{0,4}$") || !int.TryParse(value, NumberStyles.None, CultureInfo.InvariantCulture, out var number) || number > 65535)
            throw new FormatException("Invalid native recipe/record number");
        return number;
    }
    private static string Cell(string value, char separator)
    {
        if (value is null || value.Length > 1023 || value.IndexOf(separator) >= 0 || value.IndexOfAny(new[] { '\0', '\r', '\n', '\uFEFF' }) >= 0)
            throw new FormatException("Unrepresentable native recipe cell");
        return value;
    }
}
