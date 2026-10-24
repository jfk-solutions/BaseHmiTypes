using System.Security.Cryptography;
using System.Globalization;

namespace BaseHmiTypes.Recipes;

/// <summary>MD5 of exact bytes (RFC 1321); does not define a native envelope or encoding.</summary>
public static class HmiRecipeChecksum
{
    /// <summary>
    /// Computes a truncated Base64 MD5 line token. Supply the encoded row prefix,
    /// including its final separator, and the previous token plus CRLF in the
    /// file's encoding. Use an empty previous buffer for the first data row.
    /// This primitive does not validate a file's header, row order or count marker.
    /// </summary>
    public static string ComputeLine(byte[] linePrefix, byte[] previousChecksumLine, int checksumCharacters = 6)
    {
        if (linePrefix is null || previousChecksumLine is null ||
            (long)linePrefix.Length + previousChecksumLine.Length > 16 * 1024 * 1024)
            throw new ArgumentException("Invalid recipe checksum input");
        if (checksumCharacters < 1 || checksumCharacters > 24)
            throw new ArgumentOutOfRangeException(nameof(checksumCharacters));

        var input = new byte[previousChecksumLine.Length + linePrefix.Length];
        Buffer.BlockCopy(previousChecksumLine, 0, input, 0, previousChecksumLine.Length);
        Buffer.BlockCopy(linePrefix, 0, input, previousChecksumLine.Length, linePrefix.Length);
        using (var hash = MD5.Create())
            return Convert.ToBase64String(hash.ComputeHash(input)).Substring(0, checksumCharacters);
    }

    public static bool Verify(byte[] bytes,string expected)=>expected is not null && expected.Length==32 && expected.All(c=>c>='0'&&c<='9'||c>='a'&&c<='f'||c>='A'&&c<='F') && string.Equals(Compute(bytes),expected,StringComparison.OrdinalIgnoreCase);
    public static string Compute(byte[] bytes)
    {
        if(bytes is null || bytes.Length>16*1024*1024)throw new ArgumentException("Invalid recipe checksum input");
        using(var hash=MD5.Create())return string.Concat(hash.ComputeHash(bytes).Select(b=>b.ToString("x2",CultureInfo.InvariantCulture)));
    }
}
