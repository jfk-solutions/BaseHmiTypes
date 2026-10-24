using System.Collections.Concurrent;
using System.Text;

namespace BaseHmiTypes.Recipes;

internal static class HmiRecipeTextEncoding
{
    private const int Limit = 16 * 1024 * 1024;
    private sealed class Mapping
    {
        internal readonly Dictionary<int, char> Decode = new();
        internal readonly Dictionary<char, int> Encode = new();
    }
    private static readonly ConcurrentDictionary<int, Mapping> Mappings = new();
    private static Mapping Get(HmiRecipeFileEncoding encoding)
    {
        var page = encoding == HmiRecipeFileEncoding.Windows1252 ? 1252 : (int)encoding;
        return Mappings.GetOrAdd(page, number =>
        {
            var result = new Mapping(); var bytes = Convert.FromBase64String(HmiRecipeCodePagesData.Get(number));
            for (var i = 0; i < bytes.Length; i += 5)
            {
                var key = bytes[i] | bytes[i + 1] << 8; var code = (char)(bytes[i + 2] | bytes[i + 3] << 8);
                result.Decode[key] = code;
                if (bytes[i + 4] != 0) result.Encode[code] = key;
            }
            return result;
        });
    }
    internal static byte[] Encode(string text, HmiRecipeFileEncoding encoding)
    {
        if (text is null || text.Length > Limit) throw new FormatException("Invalid recipe text or encoding");
        var table = encoding == HmiRecipeFileEncoding.Utf16LittleEndian ? null : Get(encoding);
        var bytes = new byte[text.Length * 2]; var cursor = 0;
        foreach (var code in text)
        {
            if (table is null) { bytes[cursor++] = (byte)(code & 255); bytes[cursor++] = (byte)(code >> 8); }
            else
            {
                if (!table.Encode.TryGetValue(code, out var key)) throw new FormatException("Recipe character cannot be encoded in the selected code page");
                if (key >= 256) bytes[cursor++] = (byte)(key >> 8);
                bytes[cursor++] = (byte)(key & 255);
            }
        }
        if (cursor != bytes.Length) Array.Resize(ref bytes, cursor);
        return bytes;
    }
    internal static string Decode(byte[] bytes, HmiRecipeFileEncoding encoding)
    {
        if (bytes is null || bytes.Length > 2 * Limit || encoding == HmiRecipeFileEncoding.Utf16LittleEndian && bytes.Length % 2 != 0)
            throw new FormatException("Invalid recipe bytes or encoding");
        var table = encoding == HmiRecipeFileEncoding.Utf16LittleEndian ? null : Get(encoding);
        var text = new StringBuilder();
        for (var i = 0; i < bytes.Length; i++)
        {
            var key = (int)bytes[i]; char code;
            if (table is null) code = (char)(key | bytes[++i] << 8);
            else
            {
                if (!table.Decode.TryGetValue(key, out code) && i + 1 < bytes.Length) { key = key << 8 | bytes[++i]; table.Decode.TryGetValue(key, out code); }
                if (!table.Decode.ContainsKey(key) || !table.Encode.TryGetValue(code, out var canonical) || canonical != key)
                    throw new FormatException("Invalid or noncanonical recipe byte sequence");
            }
            text.Append(code);
            if (text.Length > Limit) throw new FormatException("Recipe file exceeds the text limit");
        }
        return text.ToString();
    }
}
