using System.IO.Compression;
using System.Text;

namespace BaseHmiTypes.Converters.UnifiedXml;

/// <summary>Loads the compressed catalog using only .NET runtime libraries.</summary>
public static class HmiUnifiedXmlCatalog
{
    /// <summary>Opens a fresh, non-seekable XML stream. The caller must dispose it.</summary>
    public static Stream OpenV21() => Open(HmiScreenToUnifiedXmlConverter.CatalogId);

    public static Stream Open(string id)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(id ?? "", "^[a-f0-9]{64}$")) throw new FormatException("Invalid Unified catalog identifier.");
        var stream = typeof(HmiUnifiedXmlCatalog).Assembly.GetManifestResourceStream(
            "BaseHmiTypes.Converters.UnifiedXml.Catalogs." + id + ".xml.gz")
            ?? throw new NotSupportedException("The requested Unified catalog is not bundled: " + id);
        try { return new GZipStream(stream, CompressionMode.Decompress); }
        catch { stream.Dispose(); throw; }
    }

    public static string ReadV21()
    {
        using var stream = OpenV21();
        using var reader = new StreamReader(stream, new UTF8Encoding(false, true));
        return reader.ReadToEnd();
    }
}
