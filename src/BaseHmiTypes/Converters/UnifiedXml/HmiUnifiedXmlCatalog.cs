using System.IO.Compression;
using System.Text;

namespace BaseHmiTypes.Converters.UnifiedXml;

/// <summary>Loads the compressed catalog using only .NET runtime libraries.</summary>
public static class HmiUnifiedXmlCatalog
{
    /// <summary>Opens a fresh, non-seekable XML stream. The caller must dispose it.</summary>
    public static Stream OpenV21()
    {
        var stream = typeof(HmiUnifiedXmlCatalog).Assembly.GetManifestResourceStream(
            "BaseHmiTypes.Converters.UnifiedXml.Catalogs." + HmiScreenToUnifiedXmlConverter.CatalogId + ".xml.gz")
            ?? throw new InvalidOperationException("The released V21 catalog is missing from the assembly.");
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
